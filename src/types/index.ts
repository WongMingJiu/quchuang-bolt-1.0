export type GenerationMode = 'omni-reference' | 'image-to-video-first-last' | 'image-to-video' | 'text-to-video';
export type ModelType = 'seedance2.0';
export type AspectRatio = '21:9' | '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
export type GenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type MediaType = 'image' | 'video' | 'audio';
export type CategoryType = '太极' | '唱歌' | '瑜伽' | '普拉提' | '手机摄影';
export type StoryboardType = '口播类' | '情景类' | 'IP代练';
export type UsabilityStatus = 'pending' | 'usable' | 'optimizable' | 'unusable';

export interface GenerationAsset {
  name: string;
  displayName: string;
  path: string;
  publicUrl: string;
  type: MediaType;
  size: number;
  role?: 'reference_image' | 'reference_video' | 'reference_audio' | 'first_frame' | 'last_frame';
}

export interface Generation {
  id: string;
  prompt: string;
  mode: GenerationMode;
  model: ModelType;
  category: CategoryType;
  storyboard_type: StoryboardType;
  aspect_ratio: AspectRatio;
  duration: number;
  generate_audio: boolean;
  watermark: boolean;
  status: GenerationStatus;
  video_url: string | null;
  thumbnail_url: string | null;
  last_frame_url: string | null;
  is_favorited: boolean;
  media_uploads: GenerationAsset[];
  provider: string | null;
  provider_task_id: string | null;
  error_message: string | null;
  usability_status: UsabilityStatus;
  usability_reason_tags: string[];
  usability_note: string | null;
  usability_marked_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CreationFormState {
  prompt: string;
  mode: GenerationMode;
  model: ModelType;
  category: CategoryType;
  storyboard_type: StoryboardType;
  aspect_ratio: AspectRatio;
  duration: number;
  generate_audio: boolean;
  watermark: boolean;
  media_uploads: GenerationAsset[];
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
