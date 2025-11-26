import { ImageGenerationService, GenerateImageParams } from '../../services/OpenAIService';
import Replicate from 'replicate';

// Mock environment variables
process.env.REPLICATE_API_TOKEN = 'test-api-token';

// Mock Replicate
jest.mock('replicate');

const mockRun = jest.fn();

// Setup the Replicate mock
(Replicate as jest.MockedClass<typeof Replicate>).mockImplementation(() => ({
  run: mockRun,
  models: {
    list: jest.fn().mockResolvedValue([]),
  },
} as any));

describe('ImageGenerationService (Replicate)', () => {
  let imageService: ImageGenerationService;

  beforeEach(() => {
    jest.clearAllMocks();
    imageService = new ImageGenerationService();
  });

  describe('generateImage', () => {
    it('should generate an image successfully', async () => {
      const mockImageUrl = 'https://replicate.delivery/pbxt/test-image.png';
      mockRun.mockResolvedValue([mockImageUrl]);

      const params: GenerateImageParams = {
        prompt: 'A beautiful sunset',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      };

      const result = await imageService.generateImage(params);

      expect(result.url).toBe(mockImageUrl);
      expect(result.revisedPrompt).toBe('A beautiful sunset');
      expect(mockRun).toHaveBeenCalledWith(
        'black-forest-labs/flux-schnell',
        {
          input: {
            prompt: 'A beautiful sunset',
            width: 1024,
            height: 1024,
            num_outputs: 1,
            output_format: 'png',
            output_quality: 80,
          }
        }
      );
    });

    it('should throw ValidationError for empty prompt', async () => {
      const params: GenerateImageParams = {
        prompt: '',
      };

      await expect(imageService.generateImage(params)).rejects.toThrow('Prompt cannot be empty');
    });

    it('should throw ValidationError for too long prompt', async () => {
      const params: GenerateImageParams = {
        prompt: 'a'.repeat(4001),
      };

      await expect(imageService.generateImage(params)).rejects.toThrow('Prompt is too long');
    });

    it('should throw ExternalServiceError when Replicate API fails', async () => {
      mockRun.mockRejectedValue(new Error('API Error'));

      const params: GenerateImageParams = {
        prompt: 'Test prompt',
      };

      await expect(imageService.generateImage(params)).rejects.toThrow('Replicate API Error');
    });
  });
});
