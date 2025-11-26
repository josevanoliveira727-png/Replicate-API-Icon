// Mock environment variables FIRST before any imports
process.env.REPLICATE_API_TOKEN = 'test-api-token';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import Replicate from 'replicate';

// Mock Replicate before importing app
jest.mock('replicate');

const mockRun = jest.fn();

// Setup the Replicate mock
(Replicate as jest.MockedClass<typeof Replicate>).mockImplementation(() => ({
  run: mockRun,
  models: {
    list: jest.fn().mockResolvedValue([]),
  },
} as any));

// Now import app after mocks are set up
import app from '../../server';

describe('API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'API is running');
    });
  });

  describe('POST /api/generate-image', () => {
    it('should return 400 for missing prompt', async () => {
      const response = await request(app)
        .post('/api/generate-image')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid size', async () => {
      const response = await request(app)
        .post('/api/generate-image')
        .send({
          prompt: 'Test prompt',
          size: 'invalid-size',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/generations', () => {
    it('should return list of generations', async () => {
      const response = await request(app).get('/api/generations');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should accept pagination parameters', async () => {
      const response = await request(app)
        .get('/api/generations')
        .query({ page: 1, pageSize: 10 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(10);
    });
  });

  describe('GET /api/generations/:id', () => {
    it('should return 404 for non-existent ID', async () => {
      const response = await request(app).get('/api/generations/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
