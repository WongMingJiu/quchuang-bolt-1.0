import { useState } from 'react';
import { CreditCard as Edit3, RefreshCw, Trash2, Star, Download, Zap, ArrowUpCircle, Clock, AlertCircle, Loader, Play } from 'lucide-react';
import type { Generation, UsabilityStatus } from '../../types';
import { updateUsabilityAnnotation } from '../../lib/supabase';
import VideoPreviewModal from '../media/VideoPreviewModal';
import UsabilityAnnotationModal from '../annotation/UsabilityAnnotationModal';

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

const ANNOTATION_LABELS: Record<UsabilityStatus, string> = {
  pending: '待标注',
  usable: '可用',
  optimizable: '可优化',
  unusable: '不可用',
};

const ANNOTATION_BADGE_STYLES: Record<UsabilityStatus, string> = {
  pending: 'bg-[#F1F5F9] text-[#64748B]',
  usable: 'bg-[#DCFCE7] text-[#166534]',
  optimizable: 'bg-[#FEF3C7] text-[#B45309]',
  unusable: 'bg-[#FEE2E2] text-[#B91C1C]',
};

export default function HistoryCard({ generation: g, onRefill, onRegenerate, onDelete, onToggleFavorite }: HistoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const [downloadIntent, setDownloadIntent] = useState(false);
  const [localStatus, setLocalStatus] = useState<UsabilityStatus>(g.usability_status ?? 'pending');

  const isGenerating = g.status === 'generating';
  const isFailed = g.status === 'failed';
  const isCompleted = g.status === 'completed';
  const previewImage = g.thumbnail_url ?? g.last_frame_url;
  const usabilityStatus = localStatus;

  const triggerDownload = () => {
    if (!g.video_url) return;
    const link = document.createElement('a');
    link.href = g.video_url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

          <div className={`absolute top-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ANNOTATION_BADGE_STYLES[usabilityStatus]}`}>
            {ANNOTATION_LABELS[usabilityStatus]}
          </div>

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

          <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] text-xs">
            <div className="flex items-center gap-2 text-[#475569]">
              <span className="text-[#94A3B8]">可用性标注：</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${ANNOTATION_BADGE_STYLES[usabilityStatus]}`}>
                {ANNOTATION_LABELS[usabilityStatus]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setDownloadIntent(false);
                setAnnotationOpen(true);
              }}
              className="text-[#1F8BFF] hover:text-[#1677FF] font-medium transition-colors"
            >
              {usabilityStatus === 'pending' ? '去标注' : '修改'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E6EDF5]">
            <div className="flex items-center gap-0.5">
              <button onClick={() => onRefill(g)} title="重新编辑" className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#475569] hover:bg-[#EAF3FF] hover:text-[#1F8BFF] transition-all duration-150 font-medium"><Edit3 size={13} /><span className="hidden sm:inline">编辑</span></button>
              <button onClick={() => onRegenerate(g)} title="重新生成" className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#475569] hover:bg-[#EAF3FF] hover:text-[#1F8BFF] transition-all duration-150 font-medium"><RefreshCw size={13} /><span className="hidden sm:inline">再生成</span></button>
            </div>

            <div className="flex items-center gap-0.5">
              <button onClick={() => onToggleFavorite(g.id, g.is_favorited)} title={g.is_favorited ? '取消收藏' : '收藏'} className={`p-1.5 rounded transition-all duration-150 ${g.is_favorited ? 'text-[#F59E0B] hover:text-[#D97706]' : 'text-[#94A3B8] hover:text-[#F59E0B] hover:bg-[#FEF3C7]'}`}><Star size={14} className={g.is_favorited ? 'fill-current' : ''} /></button>
              {g.status === 'completed' && g.video_url && (
                usabilityStatus === 'pending' ? (
                  <button
                    type="button"
                    title="下载前需先标注"
                    onClick={() => {
                      setDownloadIntent(true);
                      setAnnotationOpen(true);
                    }}
                    className="p-1.5 rounded text-[#F59E0B] hover:text-[#D97706] hover:bg-[#FEF3C7] transition-all duration-150"
                  >
                    <Download size={14} />
                  </button>
                ) : (
                  <a href={g.video_url} download title="下载" className="p-1.5 rounded text-[#94A3B8] hover:text-[#1F8BFF] hover:bg-[#EAF3FF] transition-all duration-150"><Download size={14} /></a>
                )
              )}
              <div className="relative">
                <button title="删除" onClick={() => setShowDelete(true)} className="p-1.5 rounded text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-150"><Trash2 size={14} /></button>
                {showDelete && <div className="absolute bottom-8 right-0 bg-white rounded-lg shadow-elevated border border-[#E6EDF5] p-3 z-20 w-48 animate-fade-in"><p className="text-xs text-[#0F172A] font-medium mb-2">确认删除这条记录？</p><div className="flex gap-2"><button onClick={() => { onDelete(g.id); setShowDelete(false); }} className="flex-1 px-2 py-1.5 bg-[#EF4444] text-white text-xs rounded font-medium hover:bg-red-600 transition-colors">删除</button><button onClick={() => setShowDelete(false)} className="flex-1 px-2 py-1.5 bg-[#EEF4FA] text-[#475569] text-xs rounded font-medium hover:bg-[#D8E2F0] transition-colors">取消</button></div></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VideoPreviewModal open={previewOpen} generation={g} onClose={() => setPreviewOpen(false)} />
      <UsabilityAnnotationModal
        open={annotationOpen}
        generation={{ ...g, usability_status: usabilityStatus }}
        downloadIntent={downloadIntent}
        onClose={() => {
          setAnnotationOpen(false);
          setDownloadIntent(false);
        }}
        onSave={async ({ usability_status, usability_reason_tags, usability_note, continueDownload }: {
          usability_status: UsabilityStatus;
          usability_reason_tags: string[];
          usability_note: string;
          continueDownload: boolean;
        }) => {
          const updated = await updateUsabilityAnnotation(g.id, {
            usability_status,
            usability_reason_tags,
            usability_note,
          });
          if (updated) {
            setLocalStatus(updated.usability_status);
          }
          setAnnotationOpen(false);
          if (continueDownload && updated?.video_url) {
            triggerDownload();
          }
          setDownloadIntent(false);
        }}
      />
    </>
  );
}
