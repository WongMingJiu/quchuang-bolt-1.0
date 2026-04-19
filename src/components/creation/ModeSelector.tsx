import type { GenerationMode } from '../../types';

interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

const modes: { key: GenerationMode; label: string; desc: string; hint: string }[] = [
  { key: 'omni-reference', label: '全能参考', desc: '图 / 视 / 音混合参考', hint: '适合复杂多模态驱动场景' },
  { key: 'image-to-video-first-last', label: '图生视频-首尾帧', desc: '必须上传 2 张图片', hint: '适合控制起始画面与结束画面' },
  { key: 'image-to-video', label: '图生视频', desc: '支持最多 9 张图片', hint: '适合多图参考统一生成' },
  { key: 'text-to-video', label: '文生视频', desc: '无需上传素材', hint: '适合快速纯文本创作' },
];

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {modes.map(mode => {
        const isActive = value === mode.key;
        return (
          <button
            key={mode.key}
            type="button"
            onClick={() => onChange(mode.key)}
            className={`flex flex-col items-start justify-center gap-1 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
              isActive
                ? 'border-[#1F8BFF] bg-[#EAF3FF] text-[#1F8BFF] shadow-sm'
                : 'border-[#E6EDF5] bg-white text-[#475569] hover:border-[#B6E7FF] hover:bg-[#F8FBFF]'
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${isActive ? 'text-[#1F8BFF]' : 'text-[#0F172A]'}`}>
                {mode.label}
              </span>
              {isActive && <span className="text-[11px] font-semibold text-[#1F8BFF]">当前</span>}
            </div>
            <span className={`text-xs leading-tight ${isActive ? 'text-[#4AA3FF]' : 'text-[#64748B]'}`}>
              {mode.desc}
            </span>
            <span className="text-[11px] text-[#94A3B8] leading-tight">{mode.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
