import { 
  ImageGenerationRepository, 
  CreateImageGenerationDto,
  ImageGenerationFilters 
} from '../repositories/ImageGenerationRepository';
import { ImageGenerationService as ReplicateImageService, GenerateImageParams } from './OpenAIService';
import { ImageGeneration } from '../entities/ImageGeneration';
import { NotFoundError } from '../errors/AppError';
import { logger } from '../utils/logger';

export class ImageGenerationService {
  private repository: ImageGenerationRepository;
  private replicateService: ReplicateImageService;

  constructor() {
    this.repository = new ImageGenerationRepository();
    this.replicateService = new ReplicateImageService();
  }

  async generateAndSaveImage(
    params: GenerateImageParams,
    userId?: string
  ): Promise<ImageGeneration> {
    const startTime = Date.now();
    let status: 'success' | 'failed' = 'success';
    let errorMessage: string | undefined;
    let imageUrl = '';
    let revisedPrompt: string | undefined;

    try {
      // Generate image using Replicate
      const generatedImage = await this.replicateService.generateImage(params);
      imageUrl = generatedImage.url;
      revisedPrompt = generatedImage.revisedPrompt;
      
      logger.info('Image generated successfully', { 
        prompt: params.prompt.substring(0, 50),
        userId
      });
    } catch (error) {
      status = 'failed';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to generate image', { error: errorMessage, userId });
      throw error;
    } finally {
      // Save to database regardless of success or failure
      const generationTimeMs = Date.now() - startTime;

      const imageGenerationData: CreateImageGenerationDto = {
        prompt: params.prompt,
        size: params.size || '1024x1024',
        quality: params.quality || 'standard',
        style: params.style || 'vivid',
        imageUrl,
        revisedPrompt,
        userId,
        generationTimeMs,
        status,
        errorMessage,
      };

      try {
        const savedGeneration = await this.repository.create(imageGenerationData);
        
        if (status === 'success') {
          return savedGeneration;
        }
      } catch (dbError) {
        logger.error('Failed to save image generation to database', { 
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
      }
    }

    throw new Error('Image generation failed');
  }

  async getGenerationById(id: string): Promise<ImageGeneration> {
    const generation = await this.repository.findById(id);
    
    if (!generation) {
      throw new NotFoundError(`Image generation with ID ${id} not found`);
    }

    return generation;
  }

  async getGenerations(filters: ImageGenerationFilters): Promise<{
    data: ImageGeneration[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const [data, total] = await Promise.all([
      this.repository.findAll({ ...filters, limit, offset }),
      this.repository.count(filters),
    ]);

    return {
      data,
      total,
      page,
      pageSize: limit,
    };
  }

  async deleteGeneration(id: string): Promise<void> {
    const deleted = await this.repository.deleteById(id);
    
    if (!deleted) {
      throw new NotFoundError(`Image generation with ID ${id} not found`);
    }
  }
}
