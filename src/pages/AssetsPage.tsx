import { useState, useMemo } from 'react';
import { Star, Download, Grid3x3 as Grid3X3, Play, Image as ImageIcon } from 'lucide-react';
import type { Generation, UsabilityStatus } from '../types';
import VideoPreviewModal from '../components/media/VideoPreviewModal';
import UsabilityAnnotationModal from '../components/annotation/UsabilityAnnotationModal';

interface AssetsPageProps {
  generations: Generation[];
  onToggleFavorite: (id: string, current: boolean) => void;
}

function groupByDate(items: Generation[]): Map<string, Generation[]> {
  const map = new Map<string, Generation[]>();
  for (const item of items) {
    const date = new Date(item.created_at);
    const key = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return map;
}

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

interface AssetCardProps {
  generation: Generation;
  onToggleFavorite: (id: string, current: boolean) => void;
  onPreview: (generation: Generation) => void;
  onOpenAnnotation: (generation: Generation, downloadIntent: boolean) => void;
}

function AssetCard({ generation: g, onToggleFavorite, onPreview, onOpenAnnotation }: AssetCardProps) {
  const [hovered, setHovered] = useState(false);
  const previewImage = g.thumbnail_url ?? g.last_frame_url;
  const usabilityStatus = g.usability_status ?? 'pending';

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-[#EEF4FA] cursor-pointer transition-all duration-200 hover:shadow-elevated hover:scale-[1.01]"
      style={{ breakInside: 'avoid', marginBottom: '12px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        {previewImage ? (
          <img src={previewImage} alt={g.prompt} className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-[#E6EDF5]">
            <ImageIcon size={24} className="text-[#D8E2F0]" />
          </div>
        )}

        <div className={`absolute top-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ANNOTATION_BADGE_STYLES[usabilityStatus]}`}>
          {ANNOTATION_LABELS[usabilityStatus]}
        </div>

        {g.video_url && hovered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(g);
            }}
            className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.18)] transition-opacity duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.92)] flex items-center justify-center shadow-lg">
              <Play size={16} className="text-[#0F172A] ml-0.5" fill="#0F172A" />
            </div>
          </button>
        )}

        {hovered && (
          <div className="absolute top-2 right-2 flex items-center gap-1 animate-fade-in z-10">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(g.id, g.is_favorited); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${g.is_favorited ? 'bg-[#F59E0B] text-white' : 'bg-[rgba(255,255,255,0.9)] text-[#94A3B8] hover:text-[#F59E0B]'}`}
            >
              <Star size={12} className={g.is_favorited ? 'fill-current' : ''} />
            </button>
            {g.video_url && (
              usabilityStatus === 'pending' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAnnotation(g, true);
                  }}
                  className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.9)] flex items-center justify-center text-[#F59E0B] hover:text-[#D97706] transition-colors"
                  title="下载前需先标注"
                >
                  <Download size={12} />
                </button>
              ) : (
                <a href={g.video_url} download onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.9)] flex items-center justify-center text-[#94A3B8] hover:text-[#1F8BFF] transition-colors">
                  <Download size={12} />
                </a>
              )
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm text-[#0F172A] leading-snug line-clamp-2 mb-2">{g.prompt}</p>
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="tag text-[10px]">{g.category}</span>
          <span className="tag text-[10px]">{g.storyboard_type}</span>
          <span className="tag text-[10px]">{g.aspect_ratio}</span>
          <span className="tag text-[10px]">{g.duration}s</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] text-xs">
          <div className="flex items-center gap-2 text-[#475569]">
            <span className="text-[#94A3B8]">可用性标注：</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${ANNOTATION_BADGE_STYLES[usabilityStatus]}`}>
              {ANNOTATION_LABELS[usabilityStatus]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenAnnotation(g, false)}
            className="text-[#1F8BFF] hover:text-[#1677FF] font-medium transition-colors"
          >
            {usabilityStatus === 'pending' ? '去标注' : '修改'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssetsPage({ generations, onToggleFavorite }: AssetsPageProps) {
  const [previewTarget, setPreviewTarget] = useState<Generation | null>(null);
  const [annotationTarget, setAnnotationTarget] = useState<Generation | null>(null);
  const [downloadIntent, setDownloadIntent] = useState(false);
  const [localAnnotations, setLocalAnnotations] = useState<Record<string, UsabilityStatus>>({});

  const completed = useMemo(() => generations.filter((g: Generation) => g.status === 'completed'), [generations]);

  const filtered = useMemo(() => {
    return completed.map(item => ({
      ...item,
      usability_status: localAnnotations[item.id] ?? item.usability_status,
    }));
  }, [completed, localAnnotations]);

  const grouped = useMemo(() => groupByDate(filtered as Generation[]), [filtered]);

  const triggerDownload = (generation: Generation | null) => {
    if (!generation?.video_url) return;
    const link = document.createElement('a');
    link.href = generation.video_url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[#F5F7FB]">
        <div className="px-6 py-4 bg-white border-b border-[#E6EDF5] flex-shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-[#0F172A]">资产</h1>
              <span className="text-xs text-[#94A3B8] bg-[#EEF4FA] px-2 py-0.5 rounded-full font-mono">{filtered.length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center">
                <Grid3X3 size={28} className="text-[#D8E2F0]" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-[#475569]">暂无资产</p>
                <p className="text-sm text-[#94A3B8] mt-1">生成完成的内容将自动归档到这里</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(grouped.entries()).map(([date, items]: [string, Generation[]]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-[#7B8CA8] uppercase tracking-wider">{date}</span>
                    <div className="flex-1 h-px bg-[#E6EDF5]" />
                    <span className="text-xs text-[#94A3B8]">{items.length} 个</span>
                  </div>
                  <div style={{ columns: '3 240px', gap: '12px' }}>
                    {items.map((g: Generation) => (
                      <AssetCard key={g.id} generation={g} onToggleFavorite={onToggleFavorite} onPreview={setPreviewTarget} onOpenAnnotation={(generation, intent) => { setAnnotationTarget(generation); setDownloadIntent(intent); }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VideoPreviewModal open={Boolean(previewTarget)} generation={previewTarget} onClose={() => setPreviewTarget(null)} />
      <UsabilityAnnotationModal
        open={Boolean(annotationTarget)}
        generation={annotationTarget}
        downloadIntent={downloadIntent}
        onClose={() => {
          setAnnotationTarget(null);
          setDownloadIntent(false);
        }}
        onSave={({ usability_status, continueDownload }) => {
          if (annotationTarget) {
            setLocalAnnotations(prev => ({ ...prev, [annotationTarget.id]: usability_status }));
          }
          const current = annotationTarget;
          setAnnotationTarget(null);
          if (continueDownload) {
            triggerDownload(current);
          }
          setDownloadIntent(false);
        }}
      />
    </>
  );
}
