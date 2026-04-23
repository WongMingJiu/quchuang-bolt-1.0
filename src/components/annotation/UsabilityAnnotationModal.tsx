import { useEffect, useMemo, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import type { Generation, UsabilityStatus } from '../../types';

interface UsabilityAnnotationModalProps {
  open: boolean;
  generation: Generation | null;
  downloadIntent?: boolean;
  onClose: () => void;
  onSave?: (payload: {
    usability_status: UsabilityStatus;
    usability_reason_tags: string[];
    usability_note: string;
    continueDownload: boolean;
  }) => void;
}

const STATUS_OPTIONS: Array<{ value: UsabilityStatus; label: string; description: string }> = [
  { value: 'usable', label: '可用', description: '结果质量达标，可直接使用。' },
  { value: 'optimizable', label: '可优化', description: '结果基本可用，但还需要进一步优化。' },
  { value: 'unusable', label: '不可用', description: '当前结果不建议继续使用。' },
];

const REASON_TAGS: Record<'optimizable' | 'unusable', string[]> = {
  optimizable: ['动作不自然', '节奏不稳', '画面细节欠佳', '构图可优化', '人物表现可优化'],
  unusable: ['画面崩坏', '人物异常', '风格偏离', '动作错误', '结果不可用'],
};

const STATUS_STYLES: Record<UsabilityStatus, string> = {
  pending: 'bg-[#F1F5F9] text-[#64748B]',
  usable: 'bg-[#DCFCE7] text-[#166534]',
  optimizable: 'bg-[#FEF3C7] text-[#B45309]',
  unusable: 'bg-[#FEE2E2] text-[#B91C1C]',
};

function getPreviewNode(generation: Generation) {
  const previewImage = generation.thumbnail_url ?? generation.last_frame_url;
  if (previewImage) {
    return <img src={previewImage} alt={generation.prompt} className="h-16 w-16 rounded-xl object-cover" />;
  }
  if (generation.video_url) {
    return <video src={generation.video_url} className="h-16 w-16 rounded-xl object-cover" muted playsInline />;
  }
  return (
    <div className="h-16 w-16 rounded-xl bg-[#EEF4FA] flex items-center justify-center text-[#94A3B8]">
      <ImageIcon size={24} />
    </div>
  );
}

export default function UsabilityAnnotationModal({ open, generation, downloadIntent = false, onClose, onSave }: UsabilityAnnotationModalProps) {
  const [status, setStatus] = useState<UsabilityStatus>('usable');
  const [reasonTags, setReasonTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open || !generation) return;
    setStatus(generation.usability_status ?? 'pending');
    setReasonTags(generation.usability_reason_tags ?? []);
    setNote(generation.usability_note ?? '');
  }, [open, generation]);

  const visibleTags = useMemo(() => {
    if (status === 'optimizable' || status === 'unusable') return REASON_TAGS[status];
    return [];
  }, [status]);

  if (!open || !generation) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(15,23,42,0.54)] backdrop-blur-[2px]">
      <div className="w-[min(92vw,620px)] rounded-2xl bg-white shadow-2xl border border-[#E6EDF5] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6EDF5]">
          <div>
            <h3 className="text-base font-semibold text-[#0F172A]">{downloadIntent ? '下载前请先完成可用性标注' : '可用性标注'}</h3>
            <p className="text-xs text-[#7B8CA8] mt-1">标注结果将决定该任务是否可以直接下载，并在卡片上持续回显。</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-[#F5F7FB] text-[#94A3B8] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div className="flex items-start gap-4 rounded-xl bg-[#F8FAFC] border border-[#E6EDF5] p-4">
            {getPreviewNode(generation)}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#0F172A] line-clamp-2">{generation.prompt || '无提示词'}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#64748B]">
                <span className="tag">{generation.aspect_ratio}</span>
                <span className="tag">{generation.duration}s</span>
                <span className="tag">{generation.category}</span>
                <span className="tag">{generation.storyboard_type}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0F172A] mb-3">主状态</p>
            <div className="grid grid-cols-3 gap-3">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStatus(option.value);
                    setReasonTags([]);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${status === option.value ? 'border-[#1F8BFF] bg-[#EAF3FF]' : 'border-[#E6EDF5] hover:border-[#CBD5E1] bg-white'}`}
                >
                  <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[option.value]}`}>
                    {option.label}
                  </div>
                  <p className="text-xs text-[#64748B] mt-2">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {visibleTags.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#0F172A] mb-3">原因标签</p>
              <div className="flex flex-wrap gap-2">
                {visibleTags.map(tag => {
                  const active = reasonTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setReasonTags(prev => active ? prev.filter(item => item !== tag) : [...prev, tag])}
                      className={`px-3 py-2 rounded-xl text-sm transition-all ${active ? 'bg-[#EAF3FF] border border-[#1F8BFF] text-[#1F8BFF]' : 'bg-white border border-[#E6EDF5] text-[#475569] hover:border-[#CBD5E1]'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#0F172A]">备注</p>
              <span className="text-xs text-[#94A3B8]">{note.length} / 200</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              rows={4}
              placeholder="补充说明为什么可用 / 可优化 / 不可用（可选）"
              className="w-full rounded-xl border border-[#E6EDF5] px-3 py-3 text-sm text-[#0F172A] outline-none focus:border-[#1F8BFF]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#E6EDF5] bg-[#FAFBFC]">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[#E6EDF5] text-sm text-[#475569] hover:border-[#CBD5E1] transition-all">
            取消
          </button>
          <button
            type="button"
            onClick={() => onSave?.({
              usability_status: status,
              usability_reason_tags: reasonTags,
              usability_note: note,
              continueDownload: downloadIntent,
            })}
            className="px-4 py-2 rounded-xl bg-[#1F8BFF] text-white text-sm font-medium hover:bg-[#1677FF] transition-all"
          >
            {downloadIntent ? '保存并下载' : '保存标注'}
          </button>
        </div>
      </div>
    </div>
  );
}
