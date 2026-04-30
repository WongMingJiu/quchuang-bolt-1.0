import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Maximize2, Pause, Play, Volume2, VolumeX, Download, Keyboard, Clock3, AlertCircle } from 'lucide-react';
import type { Generation } from '../../types';

interface VideoPreviewModalProps {
  open: boolean;
  generation: Generation | null;
  onClose: () => void;
}

function formatSeconds(value: number) {
  if (!Number.isFinite(value)) return '00:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDateTime(value: string | null) {
  if (!value) return '未知时间';
  const date = new Date(value);
  return date.toLocaleString('zh-CN');
}

const MODE_LABELS: Record<string, string> = {
  'text-to-video': '文生视频',
  'image-to-video': '图生视频',
  'image-to-video-first-last': '图生视频-首尾帧',
  'omni-reference': '全能参考',
};

export default function VideoPreviewModal({ open, generation, onClose }: VideoPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
      setLoading(false);
      setLoadError(null);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoadError(null);
    }
  }, [open, generation?.id, generation?.video_url]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (!open || !videoRef.current) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        await videoRef.current.requestFullscreen?.();
        return;
      }

      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        videoRef.current.muted = !videoRef.current.muted;
        setMuted(videoRef.current.muted);
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
        if (videoRef.current.paused) {
          await videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, videoRef.current.duration || videoRef.current.currentTime + 5);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const metadataItems = useMemo(() => {
    if (!generation) return [];
    return [
      { label: '模式', value: MODE_LABELS[generation.mode] ?? generation.mode },
      { label: '品类', value: generation.category },
      { label: '分镜', value: generation.storyboard_type },
      { label: '比例', value: generation.aspect_ratio },
      { label: '时长', value: `${generation.duration}s` },
      { label: '声音', value: generation.generate_audio ? '有声' : '静音' },
      { label: '水印', value: generation.watermark ? '开启' : '关闭' },
    ];
  }, [generation]);

  if (!open || !generation?.video_url) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.72)] backdrop-blur-[2px]">
      <div className="relative w-[min(92vw,1100px)] rounded-2xl bg-[#0B1220] shadow-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
        <div className="flex items-start justify-between px-4 py-3 bg-[rgba(15,23,42,0.88)] border-b border-[rgba(255,255,255,0.08)] gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{generation.prompt || '视频预览'}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.55)]">
              <Clock3 size={12} />
              来源任务时间：{formatDateTime(generation.created_at)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {metadataItems.map(item => (
                <div key={item.label} className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] px-2.5 py-1 text-xs text-[rgba(255,255,255,0.78)]">
                  <span className="text-[rgba(255,255,255,0.45)]">{item.label}</span>
                  <span className="font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={generation.video_url}
              download
              className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.14)] transition-all"
              title="下载视频"
            >
              <Download size={16} />
              <span className="pointer-events-none absolute -bottom-8 right-0 rounded-md bg-[rgba(15,23,42,0.95)] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">下载视频</span>
            </a>
            <button
              type="button"
              onClick={() => void videoRef.current?.requestFullscreen?.()}
              className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.14)] transition-all"
              title="全屏 (F)"
            >
              <Maximize2 size={16} />
              <span className="pointer-events-none absolute -bottom-8 right-0 rounded-md bg-[rgba(15,23,42,0.95)] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">全屏 F</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.14)] transition-all"
              title="关闭 (Esc)"
            >
              <X size={16} />
              <span className="pointer-events-none absolute -bottom-8 right-0 rounded-md bg-[rgba(15,23,42,0.95)] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">关闭 Esc</span>
            </button>
          </div>
        </div>

        <div className="bg-black relative">
          {loading && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.35)] z-10 text-white text-sm">
              正在加载视频...
            </div>
          )}
          {loadError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[rgba(0,0,0,0.6)] px-6 text-center text-white">
              <AlertCircle size={24} className="text-[#FCA5A5]" />
              <div>
                <p className="text-sm font-medium">视频预览加载失败</p>
                <p className="mt-1 text-xs text-[rgba(255,255,255,0.72)]">{loadError}</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            src={generation.video_url}
            poster={generation.thumbnail_url ?? generation.last_frame_url ?? undefined}
            controls
            playsInline
            autoPlay
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onWaiting={() => setLoading(true)}
            onPlaying={() => {
              setLoading(false);
              setLoadError(null);
            }}
            onLoadedMetadata={(e) => {
              setLoading(false);
              setDuration(e.currentTarget.duration || 0);
            }}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onError={() => {
              setLoading(false);
              setPlaying(false);
              setLoadError('请检查视频地址是否有效、资源是否可公开访问，或是否存在跨域/鉴权限制。');
            }}
            className="w-full max-h-[78vh] bg-black"
          />
        </div>

        <div className="px-4 py-3 bg-[rgba(15,23,42,0.92)] border-t border-[rgba(255,255,255,0.08)] flex flex-wrap items-center justify-between gap-4 text-xs text-[rgba(255,255,255,0.72)]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              {playing ? <Pause size={13} /> : <Play size={13} />}
              {playing ? '播放中' : '已暂停'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              {muted ? '静音' : '有声音'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Keyboard size={13} />
              Space 播放/暂停 · ←/→ 快退快进 · F 全屏 · M 静音 · Esc 关闭
            </span>
          </div>
          <div>{formatSeconds(currentTime)} / {formatSeconds(duration)}</div>
        </div>
      </div>
    </div>
  );
}
