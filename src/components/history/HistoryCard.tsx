import { useState } from 'react';
import { CreditCard as Edit3, RefreshCw, Trash2, Star, Download, Zap, ArrowUpCircle, Clock, AlertCircle, Loader, Play } from 'lucide-react';
import type { Generation } from '../../types';
import VideoPreviewModal from '../media/VideoPreviewModal';

interface HistoryCardProps {
  generation: Generation;
  onRefill: (g: Generation) => void;
  onRegenerate: (g: Generation) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

const MODE_LABELS: Record<string, string> = {
  'text-to-video': '文生视频',
  'image-to-video': '图生视频',
  'image-to-video-first-last': '图生视频-首尾帧',
  'omni-reference': '全能参考',
};

export default function HistoryCard({ generation: g, onRefill, onRegenerate, onDelete, onToggleFavorite }: HistoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isGenerating = g.status === 'generating';
  const isFailed = g.status === 'failed';
  const isCompleted = g.status === 'completed';
  const previewImage = g.thumbnail_url ?? g.last_frame_url;

  return (
    <>
      <div className="card overflow-hidden group transition-all duration-200 hover:shadow-elevated hover:border-[#B6E7FF] animate-fade-in">
        <div
          className="relative cursor-pointer"
          style={{ paddingBottom: '56.25%' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {isCompleted && previewImage ? (
            <img src={previewImage} alt={g.prompt} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#EEF4FA] to-[#D8E2F0] flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader size={24} className="text-[#1F8BFF] animate-spin" />
                  <span className="text-xs text-[#7B8CA8]">生成中...</span>
                </div>
              ) : isFailed ? (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle size={24} className="text-[#EF4444]" />
                  <span className="text-xs text-[#EF4444]">生成失败</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Play size={24} className="text-[#94A3B8]" />
                  <span className="text-xs text-[#7B8CA8]">暂无预览</span>
                </div>
              )}
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.4)] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#1F8BFF] border-t-transparent animate-spin" />
                <div className="w-32 h-1 bg-[rgba(255,255,255,0.2)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1F8BFF] rounded-full animate-pulse-soft" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

          {isCompleted && g.video_url && hovered && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewOpen(true);
              }}
              className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.18)] transition-opacity duration-200"
            >
              <div className="w-11 h-11 rounded-full bg-[rgba(255,255,255,0.92)] flex items-center justify-center shadow-lg">
                <Play size={17} className="text-[#0F172A] ml-0.5" fill="#0F172A" />
              </div>
            </button>
          )}

          {isCompleted && hovered && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 glass-dark px-2.5 py-1.5 rounded-lg animate-fade-in">
              <button className="flex items-center gap-1 text-[#12D6FF] hover:text-white transition-colors text-xs font-medium">
                <Zap size={11} />
                补帧
              </button>
              <div className="w-px h-3 bg-[rgba(255,255,255,0.2)]" />
              <button className="flex items-center gap-1 text-[#12D6FF] hover:text-white transition-colors text-xs font-medium">
                <ArrowUpCircle size={11} />
                提升分辨率
              </button>
            </div>
          )}

          {g.is_favorited && (
            <div className="absolute top-2 right-2">
              <Star size={14} className="text-[#F59E0B] fill-[#F59E0B] drop-shadow-sm" />
            </div>
          )}

          {isGenerating && (
            <div className="absolute top-2 left-2">
              <span className="flex items-center gap-1 text-xs text-white bg-[#1F8BFF] px-2 py-0.5 rounded-full animate-pulse-soft">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                生成中
              </span>
            </div>
          )}

          {isFailed && (
            <div className="absolute top-2 left-2">
              <span className="flex items-center gap-1 text-xs text-white bg-[#EF4444] px-2 py-0.5 rounded-full">
                <AlertCircle size={10} />
                失败
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-sm text-[#0F172A] leading-snug line-clamp-2 mb-2" title={g.prompt}>
            {g.prompt || <span className="text-[#94A3B8] italic">无提示词</span>}
          </p>

          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="tag text-[10px]">{MODE_LABELS[g.mode] ?? g.mode}</span>
            <span className="tag text-[10px]">{g.category}</span>
            <span className="tag text-[10px]">{g.storyboard_type}</span>
            <span className="tag text-[10px]">{g.aspect_ratio}</span>
            <span className="tag text-[10px]">{g.duration}s</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-[#94A3B8]">
              <Clock size={10} />
              {timeAgo(g.created_at)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E6EDF5]">
            <div className="flex items-center gap-0.5">
              <button onClick={() => onRefill(g)} title="重新编辑" className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#475569] hover:bg-[#EAF3FF] hover:text-[#1F8BFF] transition-all duration-150 font-medium"><Edit3 size={13} /><span className="hidden sm:inline">编辑</span></button>
              <button onClick={() => onRegenerate(g)} title="重新生成" className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#475569] hover:bg-[#EAF3FF] hover:text-[#1F8BFF] transition-all duration-150 font-medium"><RefreshCw size={13} /><span className="hidden sm:inline">再生成</span></button>
            </div>

            <div className="flex items-center gap-0.5">
              <button onClick={() => onToggleFavorite(g.id, g.is_favorited)} title={g.is_favorited ? '取消收藏' : '收藏'} className={`p-1.5 rounded transition-all duration-150 ${g.is_favorited ? 'text-[#F59E0B] hover:text-[#D97706]' : 'text-[#94A3B8] hover:text-[#F59E0B] hover:bg-[#FEF3C7]'}`}><Star size={14} className={g.is_favorited ? 'fill-current' : ''} /></button>
              {g.status === 'completed' && g.video_url && <a href={g.video_url} download title="下载" className="p-1.5 rounded text-[#94A3B8] hover:text-[#1F8BFF] hover:bg-[#EAF3FF] transition-all duration-150"><Download size={14} /></a>}
              <div className="relative">
                <button title="删除" onClick={() => setShowDelete(true)} className="p-1.5 rounded text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-150"><Trash2 size={14} /></button>
                {showDelete && <div className="absolute bottom-8 right-0 bg-white rounded-lg shadow-elevated border border-[#E6EDF5] p-3 z-20 w-48 animate-fade-in"><p className="text-xs text-[#0F172A] font-medium mb-2">确认删除这条记录？</p><div className="flex gap-2"><button onClick={() => { onDelete(g.id); setShowDelete(false); }} className="flex-1 px-2 py-1.5 bg-[#EF4444] text-white text-xs rounded font-medium hover:bg-red-600 transition-colors">删除</button><button onClick={() => setShowDelete(false)} className="flex-1 px-2 py-1.5 bg-[#EEF4FA] text-[#475569] text-xs rounded font-medium hover:bg-[#D8E2F0] transition-colors">取消</button></div></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VideoPreviewModal open={previewOpen} generation={g} onClose={() => setPreviewOpen(false)} />
    </>
  );
}
