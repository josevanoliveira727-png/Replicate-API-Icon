import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  Index 
} from 'typeorm';

@Entity('image_generations')
export class ImageGeneration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  @Index()
  prompt!: string;

  @Column({ type: 'varchar', length: 50 })
  size!: string;

  @Column({ type: 'varchar', length: 50 })
  quality!: string;

  @Column({ type: 'varchar', length: 50 })
  style!: string;

  @Column({ type: 'text' })
  imageUrl!: string;

  @Column({ type: 'text', nullable: true })
  revisedPrompt?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'integer', default: 0 })
  generationTimeMs!: number;

  @Column({ type: 'varchar', length: 50 })
  status!: 'success' | 'failed' | 'pending';

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;
}
