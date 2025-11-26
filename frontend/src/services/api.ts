import axios from 'axios';
import { ApiResponse, ImageGenerationResponse } from '../types';
import {configDotenv} from "dotenv";

configDotenv()

const api = axios.create({
  baseURL: `${process.env.VITE_API_URL}/api`,
  timeout: 120000, // 2 minutes for image generation
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GenerateImageParams {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: string;
}

export const generateImage = async (params: GenerateImageParams): Promise<ImageGenerationResponse> => {
  try {
    const response = await api.post<ApiResponse<ImageGenerationResponse>>('/generate-image', params);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to generate image');
    }
    
    return response.data.data;
  } catch (error: any) {
    // Handle rate limit errors
    if (error.response?.status === 503 || error.response?.status === 429) {
      const errorMsg = error.response?.data?.error?.message || '';
      if (errorMsg.includes('throttled') || errorMsg.includes('rate limit') || errorMsg.includes('429')) {
        throw new Error('Replicate API rate limit exceeded. Please wait a moment and try again. The free tier allows limited requests per minute.');
      }
    }
    
    // Handle other errors
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    
    throw new Error(error.message || 'Failed to generate image');
  }
};

export default api;
