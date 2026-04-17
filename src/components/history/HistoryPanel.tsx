import { History, Inbox } from 'lucide-react';
import type { Generation } from '../../types';
import HistoryCard from './HistoryCard';

interface HistoryPanelProps {
  generations: Generation[];
  loading: boolean;
  onRefill: (g: Generation) => void;
  onRegenerate: (g: Generation) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export default function HistoryPanel({
  generations, loading, onRefill, onRegenerate, onDelete, onToggleFavorite
}: HistoryPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white border-l border-[#E6EDF5]" style={{ width: '340px', minWidth: '280px', maxWidth: '380px' }}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#E6EDF5] flex-shrink-0">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#7B8CA8]" />
          <h2 className="text-sm font-semibold text-[#0F172A]">历史记录</h2>
          {generations.length > 0 && (
            <span className="text-xs text-[#7B8CA8] bg-[#EEF4FA] px-2 py-0.5 rounded-full font-mono">
              {generations.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-[#1F8BFF] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#94A3B8]">加载历史记录...</span>
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F5F7FB] flex items-center justify-center">
              <Inbox size={24} className="text-[#D8E2F0]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#475569]">暂无生成记录</p>
              <p className="text-xs text-[#94A3B8] mt-1">生成的内容将显示在这里</p>
            </div>
          </div>
        ) : (
          generations.map(g => (
            <HistoryCard
              key={g.id}
              generation={g}
              onRefill={onRefill}
              onRegenerate={onRegenerate}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
}
