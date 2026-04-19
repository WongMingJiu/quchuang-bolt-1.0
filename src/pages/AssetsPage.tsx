import { useState, useMemo } from 'react';
import { Star, Download, Filter, Grid3x3 as Grid3X3, Play, Image as ImageIcon } from 'lucide-react';
import type { Generation, AssetType } from '../types';

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

interface AssetCardProps {
  generation: Generation;
  onToggleFavorite: (id: string, current: boolean) => void;
}

function AssetCard({ generation: g, onToggleFavorite }: AssetCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-[#EEF4FA] cursor-pointer transition-all duration-200 hover:shadow-elevated hover:scale-[1.01]"
      style={{ breakInside: 'avoid', marginBottom: '12px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {g.thumbnail_url ? (
        <img
          src={g.thumbnail_url}
          alt={g.prompt}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : g.video_url ? (
        <video
          src={g.video_url}
          className="w-full object-cover"
          muted
          playsInline
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center bg-[#E6EDF5]">
          <ImageIcon size={24} className="text-[#D8E2F0]" />
        </div>
      )}

      {g.thumbnail_url && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[rgba(15,23,42,0.3)]">
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.9)] flex items-center justify-center">
            <Play size={16} className="text-[#0F172A] ml-0.5" fill="#0F172A" />
          </div>
        </div>
      )}

      {hovered && (
        <div className="absolute top-2 right-2 flex items-center gap-1 animate-fade-in">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(g.id, g.is_favorited); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
              g.is_favorited
                ? 'bg-[#F59E0B] text-white'
                : 'bg-[rgba(255,255,255,0.9)] text-[#94A3B8] hover:text-[#F59E0B]'
            }`}
          >
            <Star size={12} className={g.is_favorited ? 'fill-current' : ''} />
          </button>
          {g.video_url && (
            <a
              href={g.video_url}
              download
              onClick={e => e.stopPropagation()}
              className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.9)] flex items-center justify-center text-[#94A3B8] hover:text-[#1F8BFF] transition-colors"
            >
              <Download size={12} />
            </a>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-[rgba(15,23,42,0.8)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-xs text-white leading-snug line-clamp-2">{g.prompt}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-[rgba(255,255,255,0.6)]">{g.model}</span>
          <span className="text-[rgba(255,255,255,0.3)]">·</span>
          <span className="text-[10px] text-[rgba(255,255,255,0.6)]">{g.aspect_ratio}</span>
          <span className="text-[rgba(255,255,255,0.3)]">·</span>
          <span className="text-[10px] text-[rgba(255,255,255,0.6)]">{g.duration}s</span>
        </div>
      </div>

      {g.is_favorited && !hovered && (
        <div className="absolute top-2 right-2">
          <Star size={13} className="text-[#F59E0B] fill-[#F59E0B] drop-shadow-sm" />
        </div>
      )}
    </div>
  );
}

export default function AssetsPage({ generations, onToggleFavorite }: AssetsPageProps) {
  const [assetType, setAssetType] = useState<AssetType>('video');
  const [favOnly, setFavOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const completed = useMemo(() =>
    generations.filter(g => g.status === 'completed'), [generations]);

  const filtered = useMemo(() => {
    let items = completed;
    if (favOnly) items = items.filter(g => g.is_favorited);
    if (sortOrder === 'oldest') items = [...items].reverse();
    return items;
  }, [completed, favOnly, sortOrder]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      <div className="px-6 py-4 bg-white border-b border-[#E6EDF5] flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-[#0F172A]">资产</h1>
            <span className="text-xs text-[#94A3B8] bg-[#EEF4FA] px-2 py-0.5 rounded-full font-mono">
              {filtered.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-[#F5F7FB] p-0.5 rounded-lg border border-[#E6EDF5]">
              {(['video', 'image'] as AssetType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setAssetType(t)}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    assetType === t
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#7B8CA8] hover:text-[#475569]'
                  }`}
                >
                  {t === 'video' ? <Play size={13} className={assetType === t ? 'text-[#1F8BFF]' : ''} /> : <ImageIcon size={13} />}
                  {t === 'video' ? '视频' : '图片'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFavOnly(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                favOnly
                  ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                  : 'bg-white text-[#475569] border-[#E6EDF5] hover:border-[#D8E2F0]'
              }`}
            >
              <Star size={14} className={favOnly ? 'fill-current text-[#F59E0B]' : ''} />
              收藏
            </button>

            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-[#E6EDF5] bg-white text-[#475569] hover:border-[#D8E2F0] transition-all duration-200">
                <Filter size={14} />
                {sortOrder === 'newest' ? '最新优先' : '最早优先'}
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-white rounded-lg shadow-elevated border border-[#E6EDF5] overflow-hidden z-20 w-32 animate-fade-in">
                {(['newest', 'oldest'] as const).map(o => (
                  <button
                    key={o}
                    onClick={() => setSortOrder(o)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      sortOrder === o ? 'bg-[#EAF3FF] text-[#1F8BFF]' : 'text-[#475569] hover:bg-[#F5F9FF]'
                    }`}
                  >
                    {o === 'newest' ? '最新优先' : '最早优先'}
                  </button>
                ))}
              </div>
            </div>
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
              <p className="text-base font-semibold text-[#475569]">
                {favOnly ? '暂无收藏内容' : '暂无资产'}
              </p>
              <p className="text-sm text-[#94A3B8] mt-1">
                {favOnly ? '收藏生成结果后将显示在这里' : '生成完成的内容将自动归档到这里'}
              </p>
            </div>
            {favOnly && (
              <button
                onClick={() => setFavOnly(false)}
                className="text-sm text-[#1F8BFF] hover:text-[#4AA3FF] transition-colors"
              >
                查看全部资产
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[#7B8CA8] uppercase tracking-wider">{date}</span>
                  <div className="flex-1 h-px bg-[#E6EDF5]" />
                  <span className="text-xs text-[#94A3B8]">{items.length} 个</span>
                </div>
                <div style={{ columns: '3 240px', gap: '12px' }}>
                  {items.map(g => (
                    <AssetCard key={g.id} generation={g} onToggleFavorite={onToggleFavorite} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
