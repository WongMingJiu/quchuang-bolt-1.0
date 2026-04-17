import type { GenerationMode } from '../../types';

interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

const modes: { key: GenerationMode; label: string; desc: string }[] = [
  { key: 'text-to-video', label: '文生视频', desc: '纯文字描述生成' },
  { key: 'image-to-video', label: '图生视频', desc: '上传图片驱动' },
  { key: 'all-reference', label: '全能参考', desc: '多模态融合生成' },
];

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0F172A] mb-2.5">生成模式</label>
      <div className="grid grid-cols-3 gap-2">
        {modes.map(mode => {
          const isActive = value === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => onChange(mode.key)}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                isActive
                  ? 'border-[#1F8BFF] bg-[#EAF3FF] text-[#1F8BFF]'
                  : 'border-[#E6EDF5] bg-white text-[#475569] hover:border-[#B6E7FF] hover:bg-[#F5F9FF]'
              }`}
            >
              <span className={`text-sm font-semibold ${isActive ? 'text-[#1F8BFF]' : 'text-[#0F172A]'}`}>
                {mode.label}
              </span>
              <span className={`text-xs leading-tight ${isActive ? 'text-[#4AA3FF]' : 'text-[#94A3B8]'}`}>
                {mode.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
