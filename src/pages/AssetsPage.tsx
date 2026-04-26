import { useMemo, useState } from 'react';
import { Star, Download, Grid3x3 as Grid3X3, Play, Image as ImageIcon, Video, Music4 } from 'lucide-react';
import type { Generation, UsabilityStatus } from '../types';
import VideoPreviewModal from '../components/media/VideoPreviewModal';
import UsabilityAnnotationModal from '../components/annotation/UsabilityAnnotationModal';
import AssetDetailDrawer from '../components/assets/AssetDetailDrawer';
import { updateUsabilityAnnotation } from '../lib/supabase';

interface AssetsPageProps {
  generations: Generation[];
  onToggleFavorite: (id: string, current: boolean) => void;
}

type AssetPrimaryTab = 'creative' | 'reference' | 'ip_teacher';
type AssetMediaFilter = 'all' | 'image' | 'video' | 'audio';
type IpTeacherTab = 'all' | 'persona' | 'scene';

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

const CATEGORY_TABS: Array<{ key: AssetPrimaryTab; label: string }> = [
  { key: 'creative', label: '创作资产' },
  { key: 'reference', label: '参考素材' },
  { key: 'ip_teacher', label: 'IP老师' },
];

const IP_TEACHER_TABS: Array<{ key: IpTeacherTab; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'persona', label: '形象' },
  { key: 'scene', label: '场景' },
];

const MEDIA_FILTERS: Array<{ key: AssetMediaFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'audio', label: '音频' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: '最新优先' },
  { key: 'oldest', label: '最早优先' },
] as const;

const MEDIA_LABELS: Record<'image' | 'video' | 'audio', string> = {
  image: '图片',
  video: '视频',
  audio: '音频',
};

const CATEGORY_LABELS: Record<AssetPrimaryTab, string> = {
  creative: '创作资产',
  reference: '参考素材',
  ip_teacher: 'IP老师',
};

const IP_TEACHER_LABELS: Record<IpTeacherTab, string> = {
  all: '全部',
  persona: '形象',
  scene: '场景',
};

const ANNOTATION_FILTER_LABELS: Record<'all' | UsabilityStatus, string> = {
  all: '全部标注',
  pending: '待标注',
  usable: '可用',
  optimizable: '可优化',
  unusable: '不可用',
};

const ANNOTATION_FILTERS: Array<{ key: 'all' | UsabilityStatus; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待标注' },
  { key: 'usable', label: '可用' },
  { key: 'optimizable', label: '可优化' },
  { key: 'unusable', label: '不可用' },
];

interface AssetCardProps {
  generation: Generation;
  category: AssetPrimaryTab;
  onToggleFavorite: (id: string, current: boolean) => void;
  onPreview: (generation: Generation) => void;
  onOpenAnnotation: (generation: Generation, downloadIntent: boolean) => void;
  onOpenDetail: (generation: Generation) => void;
}

function AssetCard({ generation: g, category, onToggleFavorite, onPreview, onOpenAnnotation, onOpenDetail }: AssetCardProps) {
  const [hovered, setHovered] = useState(false);
  const previewImage = g.thumbnail_url ?? g.last_frame_url;
  const usabilityStatus = g.usability_status ?? 'pending';
  const isCreative = category === 'creative';

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-[#EEF4FA] cursor-pointer transition-all duration-200 hover:shadow-elevated hover:scale-[1.01]"
      style={{ breakInside: 'avoid', marginBottom: '12px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenDetail(g)}
    >
      <div className="relative">
        {previewImage ? (
          <img src={previewImage} alt={g.prompt} className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : g.asset_media_type === 'video' ? (
          <div className="w-full aspect-video flex items-center justify-center bg-[#E6EDF5]">
            <Video size={24} className="text-[#D8E2F0]" />
          </div>
        ) : g.asset_media_type === 'audio' ? (
          <div className="w-full aspect-video flex items-center justify-center bg-[#E6EDF5]">
            <Music4 size={24} className="text-[#D8E2F0]" />
          </div>
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-[#E6EDF5]">
            <ImageIcon size={24} className="text-[#D8E2F0]" />
          </div>
        )}

        {isCreative && (
          <div className={`absolute top-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ANNOTATION_BADGE_STYLES[usabilityStatus]}`}>
            {ANNOTATION_LABELS[usabilityStatus]}
          </div>
        )}

        <div className="absolute top-2 left-2 translate-y-6 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[rgba(15,23,42,0.72)] text-white">
          {MEDIA_LABELS[g.asset_media_type ?? 'video']}
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
              isCreative && usabilityStatus === 'pending' ? (
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
        <p className="text-sm text-[#0F172A] leading-snug line-clamp-2 mb-2">{g.prompt || '未命名资产'}</p>
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="tag text-[10px]">{g.category}</span>
          <span className="tag text-[10px]">{g.storyboard_type}</span>
          <span className="tag text-[10px]">{MEDIA_LABELS[g.asset_media_type ?? 'video']}</span>
          {g.ip_asset_type && <span className="tag text-[10px]">{g.ip_asset_type === 'persona' ? '形象' : '场景'}</span>}
        </div>
        {isCreative && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] text-xs">
            <div className="flex items-center gap-2 text-[#475569]">
              <span className="text-[#94A3B8]">可用性标注：</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${ANNOTATION_BADGE_STYLES[usabilityStatus]}`}>
                {ANNOTATION_LABELS[usabilityStatus]}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAnnotation(g, false);
              }}
              className="text-[#1F8BFF] hover:text-[#1677FF] font-medium transition-colors"
            >
              {usabilityStatus === 'pending' ? '去标注' : '修改'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssetsPage({ generations, onToggleFavorite }: AssetsPageProps) {
  const [activeCategory, setActiveCategory] = useState<AssetPrimaryTab>('creative');
  const [activeMediaFilter, setActiveMediaFilter] = useState<AssetMediaFilter>('all');
  const [activeIpTab, setActiveIpTab] = useState<IpTeacherTab>('all');
  const [favOnly, setFavOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [annotationFilter, setAnnotationFilter] = useState<'all' | UsabilityStatus>('all');
  const [previewTarget, setPreviewTarget] = useState<Generation | null>(null);
  const [detailTarget, setDetailTarget] = useState<Generation | null>(null);
  const [annotationTarget, setAnnotationTarget] = useState<Generation | null>(null);
  const [downloadIntent, setDownloadIntent] = useState(false);
  const [localAnnotations, setLocalAnnotations] = useState<Record<string, UsabilityStatus>>({});

  const creativeAssets = useMemo(() => generations.filter(g => (g.asset_category ?? 'creative') === 'creative' && g.status === 'completed'), [generations]);
  const referenceAssets = useMemo(() => generations.filter(g => g.asset_category === 'reference'), [generations]);
  const ipTeacherAssets = useMemo(() => generations.filter(g => g.asset_category === 'ip_teacher'), [generations]);

  const currentItems = useMemo(() => {
    let items: Generation[] = [];
    if (activeCategory === 'creative') items = creativeAssets;
    if (activeCategory === 'reference') items = referenceAssets;
    if (activeCategory === 'ip_teacher') {
      items = ipTeacherAssets;
      if (activeIpTab !== 'all') {
        items = items.filter(g => g.ip_asset_type === activeIpTab);
      }
    }

    if (favOnly) items = items.filter(g => g.is_favorited);
    if (activeMediaFilter !== 'all') {
      items = items.filter(g => g.asset_media_type === activeMediaFilter);
    }
    if (activeCategory === 'creative' && annotationFilter !== 'all') {
      items = items.filter(g => (localAnnotations[g.id] ?? g.usability_status ?? 'pending') === annotationFilter);
    }
    if (sortOrder === 'oldest') items = [...items].reverse();

    return items.map(item => ({
      ...item,
      usability_status: localAnnotations[item.id] ?? item.usability_status,
    }));
  }, [activeCategory, activeIpTab, creativeAssets, referenceAssets, ipTeacherAssets, favOnly, activeMediaFilter, annotationFilter, sortOrder, localAnnotations]);

  const grouped = useMemo(() => groupByDate(currentItems as Generation[]), [currentItems]);

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
        <div className="px-6 py-4 bg-white border-b border-[#E6EDF5] flex-shrink-0 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-[#0F172A]">资产</h1>
              <span className="text-xs text-[#94A3B8] bg-[#EEF4FA] px-2 py-0.5 rounded-full font-mono">{currentItems.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveCategory(tab.key);
                  setActiveIpTab('all');
                  setActiveMediaFilter('all');
                  setAnnotationFilter('all');
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeCategory === tab.key ? 'bg-[#0F172A] text-white' : 'bg-white border border-[#E6EDF5] text-[#475569] hover:border-[#CBD5E1]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeCategory === 'ip_teacher' && (
            <div className="flex items-center gap-2 flex-wrap">
              {IP_TEACHER_TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveIpTab(tab.key);
                    setActiveMediaFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeIpTab === tab.key ? 'bg-[#EAF3FF] text-[#1F8BFF] border border-[#B6E7FF]' : 'bg-white border border-[#E6EDF5] text-[#475569] hover:border-[#CBD5E1]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setFavOnly(v => !v)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${favOnly ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : 'bg-white text-[#475569] border border-[#E6EDF5] hover:border-[#D8E2F0]'}`}>
              <Star size={14} className={favOnly ? 'fill-current text-[#F59E0B]' : ''} />
              收藏
            </button>

            <div className="flex bg-[#F5F7FB] p-0.5 rounded-lg border border-[#E6EDF5]">
              {MEDIA_FILTERS.map(filter => (
                <button key={filter.key} onClick={() => setActiveMediaFilter(filter.key)} className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${activeMediaFilter === filter.key ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#7B8CA8] hover:text-[#475569]'}`}>
                  {filter.label}
                </button>
              ))}
            </div>

            {activeCategory === 'creative' && (
              <div className="flex bg-[#F5F7FB] p-0.5 rounded-lg border border-[#E6EDF5]">
                {ANNOTATION_FILTERS.map(filter => (
                  <button key={filter.key} onClick={() => setAnnotationFilter(filter.key)} className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${annotationFilter === filter.key ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#7B8CA8] hover:text-[#475569]'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            )}

            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-[#E6EDF5] bg-white text-[#475569] hover:border-[#D8E2F0] transition-all duration-200">
                {sortOrder === 'newest' ? '最新优先' : '最早优先'}
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-white rounded-lg shadow-elevated border border-[#E6EDF5] overflow-hidden z-20 w-32 animate-fade-in">
                {SORT_OPTIONS.map(o => (
                  <button key={o.key} onClick={() => setSortOrder(o.key)} className={`w-full text-left px-3 py-2 text-sm transition-colors ${sortOrder === o.key ? 'bg-[#EAF3FF] text-[#1F8BFF]' : 'text-[#475569] hover:bg-[#F5F9FF]'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E6EDF5] text-xs text-[#64748B]">
            当前筛选：{CATEGORY_LABELS[activeCategory]}
            {activeCategory === 'ip_teacher' ? ` / ${IP_TEACHER_LABELS[activeIpTab]}` : ''}
            {` / ${MEDIA_FILTERS.find(item => item.key === activeMediaFilter)?.label ?? '全部'}`}
            {activeCategory === 'creative' ? ` / ${ANNOTATION_FILTER_LABELS[annotationFilter]}` : ''}
            {favOnly ? ' / 已开启收藏筛选' : ''}
            {` / ${SORT_OPTIONS.find(item => item.key === sortOrder)?.label ?? '最新优先'}`}
            {` / 当前结果 ${currentItems.length} 个`}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center">
                <Grid3X3 size={28} className="text-[#D8E2F0]" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-[#475569]">暂无资产</p>
                <p className="text-sm text-[#94A3B8] mt-1">当前分类下暂无可展示资产</p>
              </div>
            </div>
          ) : activeCategory === 'creative' ? (
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
                      <AssetCard key={g.id} generation={g} category={activeCategory} onToggleFavorite={onToggleFavorite} onPreview={setPreviewTarget} onOpenAnnotation={(generation, intent) => { setAnnotationTarget(generation); setDownloadIntent(intent); }} onOpenDetail={setDetailTarget} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ columns: '3 240px', gap: '12px' }}>
              {currentItems.map((g: Generation) => (
                <AssetCard key={g.id} generation={g} category={activeCategory} onToggleFavorite={onToggleFavorite} onPreview={setPreviewTarget} onOpenAnnotation={(generation, intent) => { setAnnotationTarget(generation); setDownloadIntent(intent); }} onOpenDetail={setDetailTarget} />
              ))}
            </div>
          )}
        </div>
      </div>

      <VideoPreviewModal open={Boolean(previewTarget)} generation={previewTarget} onClose={() => setPreviewTarget(null)} />
      <AssetDetailDrawer open={Boolean(detailTarget)} asset={detailTarget} onClose={() => setDetailTarget(null)} />
      <UsabilityAnnotationModal
        open={Boolean(annotationTarget)}
        generation={annotationTarget}
        downloadIntent={downloadIntent}
        onClose={() => {
          setAnnotationTarget(null);
          setDownloadIntent(false);
        }}
        onSave={async ({ usability_status, usability_reason_tags, usability_note, continueDownload }) => {
          const current = annotationTarget;
          if (!current) return;
          const updated = await updateUsabilityAnnotation(current.id, {
            usability_status,
            usability_reason_tags,
            usability_note,
          });
          if (updated) {
            setLocalAnnotations(prev => ({ ...prev, [updated.id]: updated.usability_status }));
          }
          setAnnotationTarget(null);
          if (continueDownload) {
            triggerDownload(updated ?? current);
          }
          setDownloadIntent(false);
        }}
      />
    </>
  );
}
