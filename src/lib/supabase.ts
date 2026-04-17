import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Generation } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isDevelopment = import.meta.env.DEV;

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
const useDemoMode = isDevelopment && !hasSupabaseConfig;

const demoGenerations: Generation[] = [
  {
    id: 'demo-1',
    prompt: '一只银白色机械狐狸在霓虹都市屋顶上奔跑，电影感镜头',
    mode: 'text-to-video',
    model: 'keling3.0',
    aspect_ratio: '16:9',
    duration: 10,
    status: 'completed',
    is_favorited: true,
    media_uploads: [],
    thumbnail_url: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=600',
    video_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'demo-2',
    prompt: '清晨山谷云海延时摄影，金色阳光穿透薄雾',
    mode: 'text-to-video',
    model: 'keling3.0',
    aspect_ratio: '16:9',
    duration: 5,
    status: 'completed',
    is_favorited: false,
    media_uploads: [],
    thumbnail_url: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=600',
    video_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

let localGenerations = [...demoGenerations];

function createLocalGeneration(payload: Omit<Generation, 'id' | 'created_at' | 'video_url' | 'thumbnail_url'>): Generation {
  return {
    ...payload,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    thumbnail_url: null,
    video_url: null,
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

export async function fetchGenerations(): Promise<Generation[]> {
  if (!supabase) {
    return [...localGenerations].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Generation[]) ?? [];
}

export async function createGeneration(payload: Omit<Generation, 'id' | 'created_at' | 'video_url' | 'thumbnail_url'>): Promise<Generation> {
  if (!supabase) {
    const generation = createLocalGeneration(payload);
    localGenerations = [generation, ...localGenerations];
    return generation;
  }

  const { data, error } = await supabase
    .from('generations')
    .insert([{ ...payload, status: 'generating', video_url: null, thumbnail_url: null }])
    .select()
    .single();
  if (error) throw error;
  return data as Generation;
}

export async function updateGeneration(id: string, updates: Partial<Generation>): Promise<void> {
  if (!supabase) {
    localGenerations = localGenerations.map(item => item.id === id ? { ...item, ...updates } : item);
    return;
  }

  const { error } = await supabase.from('generations').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteGeneration(id: string): Promise<void> {
  if (!supabase) {
    localGenerations = localGenerations.filter(item => item.id !== id);
    return;
  }

  const { error } = await supabase.from('generations').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleFavorite(id: string, is_favorited: boolean): Promise<void> {
  if (!supabase) {
    localGenerations = localGenerations.map(item => item.id === id ? { ...item, is_favorited } : item);
    return;
  }

  const { error } = await supabase.from('generations').update({ is_favorited }).eq('id', id);
  if (error) throw error;
}
