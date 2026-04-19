import { useState, useCallback, useEffect, useRef } from 'react';
import type { CreationFormState, Generation, GenerationMode } from '../types';
import CreationWorkspace from '../components/creation/CreationWorkspace';
import HistoryPanel from '../components/history/HistoryPanel';
import { deleteGeneration, toggleFavorite } from '../lib/supabase';

interface CreationPageProps {
  generations: Generation[];
  loadingHistory: boolean;
  onGenerationsChange: (updater: (prev: Generation[]) => Generation[]) => void;
  onMessage: (message: string | null) => void;
}

const DEFAULT_FORM: CreationFormState = {
  prompt: '',
  mode: 'text-to-video',
  model: 'seedance2.0',
  aspect_ratio: '16:9',
  duration: 10,
  generate_audio: true,
  watermark: false,
  media_uploads: [],
  advancedOpen: false,
};

function validateModeAssets(mode: GenerationMode, uploads: CreationFormState['media_uploads']) {
  if (mode === 'image-to-video-first-last' && uploads.length !== 2) {
    return '图生视频-首尾帧必须上传 2 张图片。';
  }

  if (mode === 'image-to-video' && uploads.some(item => item.type !== 'image')) {
    return '图生视频仅支持图片素材。';
  }

  if (mode === 'image-to-video-first-last' && uploads.some(item => item.type !== 'image')) {
    return '图生视频-首尾帧仅支持图片素材。';
  }

  if (mode === 'omni-reference' && uploads.length > 9) {
    return '全能参考最多支持 9 个文件。';
  }

  return null;
}

export default function CreationPage({ generations, loadingHistory, onGenerationsChange, onMessage }: CreationPageProps) {
  const [form, setForm] = useState<CreationFormState>(DEFAULT_FORM);
  const [generating, setGenerating] = useState(false);
  const [prefillSource, setPrefillSource] = useState<Generation | null>(null);
  const pollingRef = useRef<number | null>(null);

  const syncGeneration = useCallback((next: Generation) => {
    onGenerationsChange(prev => {
      const exists = prev.some(item => item.id === next.id);
      if (!exists) return [next, ...prev];
      return prev.map(item => item.id === next.id ? next : item);
    });
  }, [onGenerationsChange]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback((generationId: string) => {
    stopPolling();
    pollingRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/${generationId}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error ?? '轮询生成状态失败。');
        }

        syncGeneration(result.generation);

        if (result.generation.status === 'completed') {
          stopPolling();
          onMessage('视频生成完成。');
        }

        if (result.generation.status === 'failed') {
          stopPolling();
          onMessage(result.generation.error_message ?? '视频生成失败，请稍后重试。');
        }
      } catch (error) {
        stopPolling();
        onMessage(error instanceof Error ? error.message : '轮询生成状态失败。');
      }
    }, 10000);
  }, [onMessage, stopPolling, syncGeneration]);

  useEffect(() => {
    const latestGenerating = generations.find(item => item.status === 'generating' && item.provider_task_id);
    if (latestGenerating) {
      startPolling(latestGenerating.id);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [generations, startPolling, stopPolling]);

  const handleFormChange = useCallback((updates: Partial<CreationFormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = async () => {
    if (generating) return;

    const modeError = validateModeAssets(form.mode, form.media_uploads);
    if (modeError) {
      onMessage(modeError);
      return;
    }

    setGenerating(true);
    setPrefillSource(null);
    onMessage('正在提交 Seedance 生成任务，请稍候。');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: form.prompt,
          mode: form.mode,
          model: form.model,
          aspect_ratio: form.aspect_ratio,
          duration: form.duration,
          generate_audio: form.generate_audio,
          watermark: form.watermark,
          media_uploads: form.media_uploads,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? '创建 Seedance 任务失败。');
      }

      syncGeneration(result.generation);
      startPolling(result.generation.id);
      onMessage('任务已创建，正在生成中。');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : '创建任务失败，请稍后重试。');
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
      generate_audio: g.generate_audio,
      watermark: g.watermark,
      media_uploads: g.media_uploads ?? [],
      advancedOpen: false,
    });
    setPrefillSource(g);
    onMessage(`已载入历史任务：${g.prompt.slice(0, 24)}${g.prompt.length > 24 ? '…' : ''}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onMessage]);

  const handleRegenerate = async (g: Generation) => {
    if (generating) return;
    setForm({
      prompt: g.prompt,
      mode: g.mode,
      model: g.model,
      aspect_ratio: g.aspect_ratio,
      duration: g.duration,
      generate_audio: g.generate_audio,
      watermark: g.watermark,
      media_uploads: g.media_uploads ?? [],
      advancedOpen: false,
    });
    setPrefillSource(g);
    await handleGenerate();
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
      const updated = await toggleFavorite(id, !current);
      if (updated) syncGeneration(updated);
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
          onMessage={onMessage}
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
