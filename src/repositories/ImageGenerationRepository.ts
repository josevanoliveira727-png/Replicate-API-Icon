import { Repository } from 'typeorm';
import { ImageGeneration } from '../entities/ImageGeneration';
import { AppDataSource } from '../config/database';

export interface CreateImageGenerationDto {
  prompt: string;
  size: string;
  quality: string;
  style: string;
  imageUrl: string;
  revisedPrompt?: string;
  userId?: string;
  generationTimeMs: number;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface ImageGenerationFilters {
  userId?: string;
  status?: 'success' | 'failed' | 'pending';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class ImageGenerationRepository {
  private repository: Repository<ImageGeneration>;

  constructor() {
    this.repository = AppDataSource.getRepository(ImageGeneration);
  }

  async create(data: CreateImageGenerationDto): Promise<ImageGeneration> {
    const imageGeneration = this.repository.create(data);
    return await this.repository.save(imageGeneration);
  }

  async findById(id: string): Promise<ImageGeneration | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(filters: ImageGenerationFilters = {}): Promise<ImageGeneration[]> {
    const query = this.repository.createQueryBuilder('ig');

    if (filters.userId) {
      query.andWhere('ig.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query.andWhere('ig.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('ig.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('ig.createdAt <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('ig.createdAt', 'DESC');

    if (filters.limit) {
      query.take(filters.limit);
    }

    if (filters.offset) {
      query.skip(filters.offset);
    }

    return await query.getMany();
  }

  async count(filters: ImageGenerationFilters = {}): Promise<number> {
    const query = this.repository.createQueryBuilder('ig');

    if (filters.userId) {
      query.andWhere('ig.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query.andWhere('ig.status = :status', { status: filters.status });
    }

    return await query.getCount();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
