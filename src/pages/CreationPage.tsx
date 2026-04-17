import { useState, useCallback } from 'react';
import type { CreationFormState, Generation } from '../types';
import CreationWorkspace from '../components/creation/CreationWorkspace';
import HistoryPanel from '../components/history/HistoryPanel';
import { createGeneration, updateGeneration, deleteGeneration, toggleFavorite } from '../lib/supabase';

interface CreationPageProps {
  generations: Generation[];
  loadingHistory: boolean;
  onGenerationsChange: (updater: (prev: Generation[]) => Generation[]) => void;
  onMessage: (message: string | null) => void;
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

export default function CreationPage({ generations, loadingHistory, onGenerationsChange, onMessage }: CreationPageProps) {
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
    onMessage('演示版正在模拟生成流程，结果会在几秒后返回。');

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
      onMessage(success ? '演示任务已完成。' : '演示任务生成失败，请重试。');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : '创建演示任务失败，请稍后重试。');
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
    onMessage(`已载入历史任务：${g.prompt.slice(0, 24)}${g.prompt.length > 24 ? '…' : ''}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onMessage]);

  const handleRegenerate = async (g: Generation) => {
    if (generating) return;
    setGenerating(true);
    onMessage('正在重新生成演示任务，请稍候。');

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
      onMessage(success ? '重新生成完成。' : '重新生成失败，请稍后重试。');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : '重新生成失败，请稍后重试。');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGeneration(id);
      onGenerationsChange(prev => prev.filter(g => g.id !== id));
      onMessage('记录已删除。');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : '删除失败，请稍后重试。');
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      await toggleFavorite(id, !current);
      onGenerationsChange(prev =>
        prev.map(g => g.id === id ? { ...g, is_favorited: !current } : g)
      );
      onMessage(!current ? '已加入收藏。' : '已取消收藏。');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : '收藏操作失败，请稍后重试。');
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
