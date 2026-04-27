import { useState } from 'react';

interface PromptExpansionPanelProps {
  onUsePrompt: (value: string) => void;
}

interface PromptExpansionItem {
  id: string;
  title: string;
  prompt: string;
}

export default function PromptExpansionPanel({ onUsePrompt }: PromptExpansionPanelProps) {
  const [draftPrompt, setDraftPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PromptExpansionItem[]>([]);

  const handleExpand = async () => {
    if (!draftPrompt.trim()) {
      setItems([]);
      setError('请先输入待扩写的提示词草稿。');
      return;
    }

    setLoading(true);
    setError(null);
    setItems([]);
    try {
      const response = await fetch('/api/prompt-expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftPrompt: draftPrompt.trim(),
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};
      if (!response.ok) {
        throw new Error(result.error ?? '提示词扩写失败，请稍后重试。');
      }

      const nextItems = Array.isArray(result.items) ? result.items : [];
      if (!nextItems.length) {
        throw new Error('扩写服务未返回可用候选结果，请稍后重试。');
      }

      setItems(nextItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提示词扩写失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E6EDF5] bg-[#FBFCFE] px-4 py-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#0F172A]">提示词扩写</h2>
        <p className="text-xs text-[#7B8CA8] mt-1">输入一个简短想法，基于扩写技能生成更完整的 Seedance 提示词候选。</p>
      </div>

      <div className="space-y-3">
        <textarea
          value={draftPrompt}
          onChange={e => setDraftPrompt(e.target.value)}
          rows={3}
          placeholder="例如：帮我生成一个太极老师教学的视频"
          className="w-full rounded-xl border border-[#E6EDF5] bg-white px-3 py-3 text-sm text-[#0F172A] outline-none focus:border-[#1F8BFF]"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#94A3B8]">点击扩写后会生成 1~3 条候选结果，选择“使用”将覆盖正式提示词框。</span>
          <button
            type="button"
            onClick={() => void handleExpand()}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#1F8BFF] text-white text-sm font-medium hover:bg-[#1677FF] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '扩写中...' : '扩写提示词'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="px-3 py-2 rounded-xl border border-dashed border-[#D7E3F4] text-sm text-[#7B8CA8]">
          暂无扩写结果，输入草稿后点击“扩写提示词”开始生成。
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="rounded-xl border border-[#E6EDF5] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                <button
                  type="button"
                  onClick={() => onUsePrompt(item.prompt)}
                  className="px-3 py-1.5 rounded-lg border border-[#B6E7FF] text-[#1F8BFF] text-sm font-medium hover:bg-[#EAF3FF] transition-all"
                >
                  使用
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[#334155]">{item.prompt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
