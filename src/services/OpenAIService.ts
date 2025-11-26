import Replicate from 'replicate';
import { ExternalServiceError, ValidationError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { getRedisClient } from '../config/redis';
import crypto from 'crypto';
import { config } from 'dotenv';
config();

export interface GenerateImageParams {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

export class ImageGenerationService {
  private client: Replicate;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly MODEL = 'black-forest-labs/flux-schnell';

  constructor() {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    
    if (!apiKey) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    this.client = new Replicate({
      auth: apiKey,
    });
  }

  private getCacheKey(params: GenerateImageParams): string {
    const normalized = JSON.stringify({
      prompt: params.prompt.toLowerCase().trim(),
      size: params.size,
      quality: params.quality,
      style: params.style,
    });
    return `image:${crypto.createHash('md5').update(normalized).digest('hex')}`;
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    const startTime = Date.now();
    
    // Validate prompt (outside try/catch to ensure ValidationError is thrown directly)
    if (!params.prompt || params.prompt.trim().length === 0) {
      logger.error('Error generating image', { error: 'Prompt cannot be empty', duration: Date.now() - startTime });
      throw new ValidationError('Prompt cannot be empty');
    }

    if (params.prompt.length > 4000) {
      logger.error('Error generating image', { error: 'Prompt is too long (max 4000 characters)', duration: Date.now() - startTime });
      throw new ValidationError('Prompt is too long (max 4000 characters)');
    }

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(params);
      const cachedResult = await this.getCachedImage(cacheKey);
      
      if (cachedResult) {
        logger.info('Cache hit for image generation', { 
          cacheKey, 
          duration: Date.now() - startTime 
        });
        return cachedResult;
      }

      logger.info('Calling Replicate API for image generation', { 
        prompt: params.prompt.substring(0, 100),
        model: this.MODEL
      });

      // Map size to width/height for FLUX
      const sizeMap: Record<string, { width: number; height: number }> = {
        '1024x1024': { width: 1024, height: 1024 },
        '1792x1024': { width: 1792, height: 1024 },
        '1024x1792': { width: 1024, height: 1792 },
      };
      
      const dimensions = sizeMap[params.size || '1024x1024'];

      const prediction = await this.client.predictions.create({
        version: '5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637',
        input: {
          prompt: params.prompt,
          width: dimensions.width,
          height: dimensions.height,
          num_outputs: params.n || 1,
          output_format: 'png',
          output_quality: params.quality === 'hd' ? 100 : 80,
        }
      });

      logger.info('Waiting for Replicate prediction', { predictionId: prediction.id });

      // Wait for the prediction to complete
      const completed = await this.client.wait(prediction);

      if (completed.status !== 'succeeded') {
        throw new ExternalServiceError(`Prediction failed with status: ${completed.status}`);
      }

      // Extract URL from output array
      const output = completed.output;
      let imageUrl: string;
      
      if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0] as string;
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else {
        throw new ExternalServiceError(`Unexpected output format from Replicate: ${typeof output}`);
      }
      
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new ExternalServiceError('No valid URL returned from Replicate');
      }

      const result: GeneratedImage = {
        url: imageUrl,
        revisedPrompt: params.prompt, // FLUX doesn't revise prompts, use original
      };

      // Cache the result
      await this.cacheImage(cacheKey, result);

      logger.info('Image generated successfully', { 
        duration: Date.now() - startTime,
        imageUrl: imageUrl.substring(0, Math.min(100, imageUrl.length))
      });

      return result;
    } catch (error) {
      logger.error('Error generating image', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ExternalServiceError(
        error instanceof Error ? `Replicate API Error: ${error.message}` : 'Failed to generate image'
      );
    }
  }

  private async getCachedImage(key: string): Promise<GeneratedImage | null> {
    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as GeneratedImage;
      }
    } catch (error) {
      logger.warn('Cache retrieval failed', { error });
    }
    return null;
  }

  private async cacheImage(key: string, data: GeneratedImage): Promise<void> {
    try {
      const redis = getRedisClient();
      if (!redis) return;

      await redis.setEx(key, this.CACHE_TTL, JSON.stringify(data));
    } catch (error) {
      logger.warn('Cache storage failed', { error });
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Test the API by listing models
      await this.client.models.list();
      return true;
    } catch (error) {
      logger.error('Replicate API key validation failed', { error });
      return false;
    }
  }
}
