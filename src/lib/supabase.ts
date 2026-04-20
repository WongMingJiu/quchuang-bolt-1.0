import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Generation, GenerationAsset, GenerationMode } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isDevelopment = import.meta.env.DEV;
const STORAGE_BUCKET = 'generation-assets';

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
const useDemoMode = isDevelopment && !hasSupabaseConfig;

const demoGenerations: Generation[] = [
  {
    id: 'demo-1',
    prompt: '一只银白色机械狐狸在霓虹都市屋顶上奔跑，电影感镜头',
    mode: 'text-to-video',
    model: 'seedance2.0',
    aspect_ratio: '16:9',
    duration: 10,
    generate_audio: true,
    watermark: false,
    status: 'completed',
    is_favorited: true,
    media_uploads: [],
    thumbnail_url: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=600',
    video_url: null,
    last_frame_url: null,
    provider: 'demo',
    provider_task_id: null,
    error_message: null,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'demo-2',
    prompt: '清晨山谷云海延时摄影，金色阳光穿透薄雾',
    mode: 'image-to-video',
    model: 'seedance2.0',
    aspect_ratio: '16:9',
    duration: 5,
    generate_audio: false,
    watermark: false,
    status: 'completed',
    is_favorited: false,
    media_uploads: [],
    thumbnail_url: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=600',
    video_url: null,
    last_frame_url: null,
    provider: 'demo',
    provider_task_id: null,
    error_message: null,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

let localGenerations = [...demoGenerations];

function createLocalGeneration(payload: Omit<Generation, 'id' | 'created_at'>): Generation {
  return {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
}

function getSupabaseConfig() {
  if (!hasSupabaseConfig) {
    throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before publishing.');
  }

  return {
    url: supabaseUrl as string,
    anonKey: supabaseAnonKey as string,
  };
}

export const supabase: SupabaseClient | null = (() => {
  if (useDemoMode) {
    console.warn('Supabase env is missing. Running in local demo mode.');
    return null;
  }

  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
})();

export function isUsingDemoMode() {
  return useDemoMode;
}

function normalizeMode(mode: GenerationMode | 'all-reference' | 'video-to-video' | undefined): GenerationMode {
  if (mode === 'all-reference' || mode === 'video-to-video') return 'omni-reference';
  return mode ?? 'text-to-video';
}

function normalizeGeneration(row: Partial<Generation>): Generation {
  return {
    id: row.id ?? crypto.randomUUID(),
    prompt: row.prompt ?? '',
    mode: normalizeMode(row.mode as GenerationMode | 'all-reference' | 'video-to-video' | undefined),
    model: row.model ?? 'seedance2.0',
    aspect_ratio: row.aspect_ratio ?? '16:9',
    duration: row.duration ?? 5,
    generate_audio: row.generate_audio ?? true,
    watermark: row.watermark ?? false,
    status: row.status ?? 'pending',
    video_url: row.video_url ?? null,
    thumbnail_url: row.thumbnail_url ?? null,
    last_frame_url: row.last_frame_url ?? null,
    is_favorited: row.is_favorited ?? false,
    media_uploads: Array.isArray(row.media_uploads) ? row.media_uploads as GenerationAsset[] : [],
    provider: row.provider ?? null,
    provider_task_id: row.provider_task_id ?? null,
    error_message: row.error_message ?? null,
    completed_at: row.completed_at ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function uploadGenerationAsset(file: File): Promise<GenerationAsset> {
  if (!supabase) {
    throw new Error('Supabase Storage requires a configured Supabase project.');
  }

  const extension = file.name.split('.').pop() ?? 'bin';
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = `uploads/${fileName}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  const lowerName = file.name.toLowerCase();
  const type = file.type.startsWith('video/') || lowerName.endsWith('.mp4') || lowerName.endsWith('.mov')
    ? 'video'
    : file.type.startsWith('audio/') || lowerName.endsWith('.wav') || lowerName.endsWith('.mp3')
      ? 'audio'
      : 'image';

  return {
    name: file.name,
    displayName: file.name,
    path,
    publicUrl: data.publicUrl,
    type,
    size: file.size,
  };
}

export async function fetchGenerations(): Promise<Generation[]> {
  if (!supabase) {
    return [...localGenerations].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(item => normalizeGeneration(item as Partial<Generation>));
}

export async function createGeneration(payload: Omit<Generation, 'id' | 'created_at'>): Promise<Generation> {
  if (!supabase) {
    const generation = createLocalGeneration(payload);
    localGenerations = [generation, ...localGenerations];
    return generation;
  }

  const { data, error } = await supabase
    .from('generations')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return normalizeGeneration(data as Partial<Generation>);
}

export async function updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation | null> {
  if (!supabase) {
    let updated: Generation | null = null;
    localGenerations = localGenerations.map(item => {
      if (item.id !== id) return item;
      updated = normalizeGeneration({ ...item, ...updates });
      return updated;
    });
    return updated;
  }

  const { data, error } = await supabase.from('generations').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return normalizeGeneration(data as Partial<Generation>);
}

export async function deleteGeneration(id: string): Promise<void> {
  if (!supabase) {
    localGenerations = localGenerations.filter(item => item.id !== id);
    return;
  }

  const { error } = await supabase.from('generations').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleFavorite(id: string, is_favorited: boolean): Promise<Generation | null> {
  return updateGeneration(id, { is_favorited });
}
