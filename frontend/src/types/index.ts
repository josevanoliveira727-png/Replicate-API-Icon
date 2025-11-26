export type PresetStyle = 'Sticker' | 'Pastels' | 'Business' | 'Cartoon' | '3D Model' | 'Gradient';

export interface IconGenerationRequest {
  prompt: string;
  style: PresetStyle;
  colors: string[];
}

export interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
}

export interface ImageGenerationResponse {
  id: string;
  prompt: string;
  imageUrl: string;
  revisedPrompt: string;
  size: string;
  quality: string;
  style: string;
  generationTimeMs: number;
  createdAt: string;
}
