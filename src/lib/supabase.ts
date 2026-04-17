import { createClient } from '@supabase/supabase-js';
import type { Generation } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchGenerations(): Promise<Generation[]> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Generation[]) ?? [];
}

export async function createGeneration(payload: Omit<Generation, 'id' | 'created_at' | 'video_url' | 'thumbnail_url'>): Promise<Generation> {
  const { data, error } = await supabase
    .from('generations')
    .insert([{ ...payload, status: 'generating', video_url: null, thumbnail_url: null }])
    .select()
    .single();
  if (error) throw error;
  return data as Generation;
}

export async function updateGeneration(id: string, updates: Partial<Generation>): Promise<void> {
  const { error } = await supabase.from('generations').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteGeneration(id: string): Promise<void> {
  const { error } = await supabase.from('generations').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleFavorite(id: string, is_favorited: boolean): Promise<void> {
  const { error } = await supabase.from('generations').update({ is_favorited }).eq('id', id);
  if (error) throw error;
}
