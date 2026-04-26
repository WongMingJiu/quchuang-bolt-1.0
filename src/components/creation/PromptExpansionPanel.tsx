import { useState } from 'react';

interface PromptExpansionPanelProps {
  onUsePrompt: (value: string) => void;
}

const mockExpandedPrompts = [
  {
    id: 'opt-1',
    title: '优化结果 1',
    prompt: '一位太极老师在清晨竹林空地上缓缓演示云手动作，镜头稳定推近，晨雾轻盈，光线柔和，人物动作连贯自然，4K高清，面部稳定不变形，细节丰富。',
  },
  {
    id: 'opt-2',
    title: '优化结果 2',
    prompt: '太极老师身穿简洁练功服，在安静庭院中进行教学示范，先缓慢抬手再转腰带动手臂，镜头固定机位，中景拍摄，清晨自然光，画面稳定，动作清晰，人物比例准确。',
  },
  {
    id: 'opt-3',
    title: '优化结果 3',
    prompt: '一名太极老师在古风院落前完整演示起势与云手动作，镜头轻微向前推近，风吹树叶，环境安静沉稳，整体东方气质，画质细腻，人物面部与手部动作自然真实，无穿模。',
  },
];

export default function PromptExpansionPanel({ onUsePrompt }: PromptExpansionPanelProps) {
  const [draftPrompt, setDraftPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<typeof mockExpandedPrompts>([]);

  const handleExpand = async () => {
    if (!draftPrompt.trim()) {
      setError('请先输入待扩写的提示词草稿。');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setItems(mockExpandedPrompts.map(item => ({
        ...item,
        prompt: item.prompt.replace('太极老师', draftPrompt.trim()),
      })));
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
