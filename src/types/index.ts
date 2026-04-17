export type GenerationMode = 'text-to-video' | 'image-to-video' | 'all-reference';
export type ModelType = 'seedance2.0vip' | 'seedance2.0fast' | 'keling3.0';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type GenerationStatus = 'generating' | 'completed' | 'failed';

export interface Generation {
  id: string;
  prompt: string;
  mode: GenerationMode;
  model: ModelType;
  aspect_ratio: AspectRatio;
  duration: number;
  status: GenerationStatus;
  video_url: string | null;
  thumbnail_url: string | null;
  is_favorited: boolean;
  media_uploads: string[];
  created_at: string;
}

export interface CreationFormState {
  prompt: string;
  mode: GenerationMode;
  model: ModelType;
  aspect_ratio: AspectRatio;
  duration: number;
  media_uploads: string[];
  advancedOpen: boolean;
}

export interface ModelQuota {
  model: ModelType;
  label: string;
  remaining: number;
  total: number;
}

export type ActivePage = 'creation' | 'assets';
export type AssetType = 'video' | 'image';
