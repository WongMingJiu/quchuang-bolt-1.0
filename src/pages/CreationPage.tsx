import { useState, useCallback } from 'react';
import type { CreationFormState, Generation } from '../types';
import CreationWorkspace from '../components/creation/CreationWorkspace';
import HistoryPanel from '../components/history/HistoryPanel';
import { createGeneration, updateGeneration, deleteGeneration, toggleFavorite } from '../lib/supabase';

interface CreationPageProps {
  generations: Generation[];
  loadingHistory: boolean;
  onGenerationsChange: (updater: (prev: Generation[]) => Generation[]) => void;
}

const DEFAULT_FORM: CreationFormState = {
  prompt: '',
  mode: 'text-to-video',
  model: 'keling3.0',
  aspect_ratio: '16:9',
  duration: 10,
  media_uploads: [],
  advancedOpen: false,
};

const DEMO_THUMBNAILS = [
  'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export default function CreationPage({ generations, loadingHistory, onGenerationsChange }: CreationPageProps) {
  const [form, setForm] = useState<CreationFormState>(DEFAULT_FORM);
  const [generating, setGenerating] = useState(false);
  const [prefillSource, setPrefillSource] = useState<Generation | null>(null);

  const handleFormChange = useCallback((updates: Partial<CreationFormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setPrefillSource(null);

    try {
      const newGen = await createGeneration({
        prompt: form.prompt,
        mode: form.mode,
        model: form.model,
        aspect_ratio: form.aspect_ratio,
        duration: form.duration,
        is_favorited: false,
        media_uploads: form.media_uploads,
        status: 'generating',
      });

      onGenerationsChange(prev => [newGen, ...prev]);

      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

      const success = Math.random() > 0.15;
      const thumbnail = DEMO_THUMBNAILS[Math.floor(Math.random() * DEMO_THUMBNAILS.length)];

      const updates: Partial<Generation> = success
        ? { status: 'completed', thumbnail_url: thumbnail }
        : { status: 'failed' };

      await updateGeneration(newGen.id, updates);
      onGenerationsChange(prev =>
        prev.map(g => g.id === newGen.id ? { ...g, ...updates } : g)
      );
    } catch {
    } finally {
      setGenerating(false);
    }
  };

  const handleRefill = useCallback((g: Generation) => {
    setForm({
      prompt: g.prompt,
      mode: g.mode,
      model: g.model,
      aspect_ratio: g.aspect_ratio,
      duration: g.duration,
      media_uploads: g.media_uploads ?? [],
      advancedOpen: false,
    });
    setPrefillSource(g);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRegenerate = async (g: Generation) => {
    if (generating) return;
    setGenerating(true);

    try {
      const newGen = await createGeneration({
        prompt: g.prompt,
        mode: g.mode,
        model: g.model,
        aspect_ratio: g.aspect_ratio,
        duration: g.duration,
        is_favorited: false,
        media_uploads: g.media_uploads ?? [],
        status: 'generating',
      });

      onGenerationsChange(prev => [newGen, ...prev]);

      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

      const success = Math.random() > 0.15;
      const thumbnail = DEMO_THUMBNAILS[Math.floor(Math.random() * DEMO_THUMBNAILS.length)];
      const updates: Partial<Generation> = success
        ? { status: 'completed', thumbnail_url: thumbnail }
        : { status: 'failed' };

      await updateGeneration(newGen.id, updates);
      onGenerationsChange(prev =>
        prev.map(gen => gen.id === newGen.id ? { ...gen, ...updates } : gen)
      );
    } catch {
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGeneration(id);
      onGenerationsChange(prev => prev.filter(g => g.id !== id));
    } catch {
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      await toggleFavorite(id, !current);
      onGenerationsChange(prev =>
        prev.map(g => g.id === id ? { ...g, is_favorited: !current } : g)
      );
    } catch {
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        <CreationWorkspace
          form={form}
          onFormChange={handleFormChange}
          onGenerate={handleGenerate}
          generating={generating}
          prefillSource={prefillSource}
          onDismissPrefill={() => setPrefillSource(null)}
        />
      </div>

      <HistoryPanel
        generations={generations}
        loading={loadingHistory}
        onRefill={handleRefill}
        onRegenerate={handleRegenerate}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
