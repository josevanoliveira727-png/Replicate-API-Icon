import { Router, Request, Response, NextFunction } from 'express';
import { ImageGenerationService } from '../services/ImageGenerationService';
import { generateImageValidation, getGenerationsValidation } from '../middleware/validation';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/AppError';

const router = Router();
const imageGenerationService = new ImageGenerationService();

// POST /api/generate-image
router.post(
  '/generate-image',
  generateImageValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError(
          errors.array().map(err => err.msg).join(', ')
        );
      }

      const { prompt, size, quality, style } = req.body;
      const userId = req.headers['x-user-id'] as string | undefined;

      const result = await imageGenerationService.generateAndSaveImage(
        {
          prompt,
          size,
          quality,
          style,
        },
        userId
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.id,
          prompt: result.prompt,
          imageUrl: result.imageUrl,
          revisedPrompt: result.revisedPrompt,
          size: result.size,
          quality: result.quality,
          style: result.style,
          generationTimeMs: result.generationTimeMs,
          createdAt: result.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/generations/:id
router.get(
  '/generations/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const generation = await imageGenerationService.getGenerationById(id);

      res.json({
        success: true,
        data: generation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/generations
router.get(
  '/generations',
  getGenerationsValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError(
          errors.array().map(err => err.msg).join(', ')
        );
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const userId = req.query.userId as string | undefined;
      const status = req.query.status as 'success' | 'failed' | 'pending' | undefined;

      const offset = (page - 1) * pageSize;

      const result = await imageGenerationService.getGenerations({
        userId,
        status,
        limit: pageSize,
        offset,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / result.pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/generations/:id
router.delete(
  '/generations/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await imageGenerationService.deleteGeneration(id);

      res.json({
        success: true,
        message: 'Generation deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
