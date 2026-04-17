import { useState } from 'react';
import { ChevronDown, Cpu, MonitorPlay, Clock } from 'lucide-react';
import type { ModelType, AspectRatio } from '../../types';

interface AdvancedSettingsProps {
  model: ModelType;
  aspectRatio: AspectRatio;
  duration: number;
  onModelChange: (v: ModelType) => void;
  onAspectRatioChange: (v: AspectRatio) => void;
  onDurationChange: (v: number) => void;
}

const MODELS: { key: ModelType; label: string; badge?: string }[] = [
  { key: 'seedance2.0vip', label: 'Seedance 2.0 VIP', badge: 'VIP' },
  { key: 'seedance2.0fast', label: 'Seedance 2.0 Fast', badge: 'Fast' },
  { key: 'keling3.0', label: 'Keling 3.0', badge: 'Hot' },
];

const RATIOS: { key: AspectRatio; label: string; icon: string }[] = [
  { key: '16:9', label: '16:9', icon: '▬' },
  { key: '9:16', label: '9:16', icon: '▮' },
  { key: '1:1', label: '1:1', icon: '■' },
  { key: '4:3', label: '4:3', icon: '▬' },
];

const BADGE_COLORS: Record<string, string> = {
  VIP: 'text-[#F59E0B] bg-[#FEF3C7]',
  Fast: 'text-[#12D6FF] bg-[#EAFBFF]',
  Hot: 'text-[#EF4444] bg-[#FEF2F2]',
};

export default function AdvancedSettings({
  model, aspectRatio, duration,
  onModelChange, onAspectRatioChange, onDurationChange
}: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false);

  const modelLabel = MODELS.find(m => m.key === model)?.label ?? model;
  const summary = `${modelLabel} / ${aspectRatio} / ${duration}s`;

  return (
    <div className="border border-[#E6EDF5] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F5F9FF] hover:bg-[#EEF4FA] transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#0F172A]">高级设置</span>
          {!open && (
            <span className="text-xs text-[#7B8CA8] bg-[#EEF4FA] px-2 py-0.5 rounded-sm font-mono">{summary}</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-[#7B8CA8] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 py-4 space-y-5 bg-white border-t border-[#E6EDF5] animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Cpu size={14} className="text-[#7B8CA8]" />
              <label className="text-sm font-semibold text-[#0F172A]">生成模型</label>
            </div>
            <div className="space-y-2">
              {MODELS.map(m => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => onModelChange(m.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                    model === m.key
                      ? 'border-[#1F8BFF] bg-[#EAF3FF]'
                      : 'border-[#E6EDF5] hover:border-[#B6E7FF] hover:bg-[#F5F9FF]'
                  }`}
                >
                  <span className={`text-sm font-medium ${model === m.key ? 'text-[#1F8BFF]' : 'text-[#0F172A]'}`}>
                    {m.label}
                  </span>
                  {m.badge && (
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${BADGE_COLORS[m.badge]}`}>
                      {m.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <MonitorPlay size={14} className="text-[#7B8CA8]" />
              <label className="text-sm font-semibold text-[#0F172A]">视频比例</label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {RATIOS.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => onAspectRatioChange(r.key)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                    aspectRatio === r.key
                      ? 'border-[#1F8BFF] bg-[#EAF3FF] text-[#1F8BFF]'
                      : 'border-[#E6EDF5] hover:border-[#B6E7FF] text-[#475569]'
                  }`}
                >
                  <span className="text-base leading-none">{r.icon}</span>
                  <span className="text-xs font-semibold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#7B8CA8]" />
                <label className="text-sm font-semibold text-[#0F172A]">视频时长</label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1F8BFF]">{duration}s</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#94A3B8] w-6">5s</span>
              <input
                type="range"
                min={5}
                max={15}
                step={1}
                value={duration}
                onChange={e => onDurationChange(Number(e.target.value))}
                className="flex-1 h-1.5 appearance-none cursor-pointer rounded-full"
                style={{
                  background: `linear-gradient(to right, #1F8BFF ${((duration - 5) / 10) * 100}%, #E6EDF5 ${((duration - 5) / 10) * 100}%)`
                }}
              />
              <span className="text-xs text-[#94A3B8] w-6">15s</span>
            </div>
            <div className="flex justify-between mt-1.5">
              {[5, 8, 10, 12, 15].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onDurationChange(v)}
                  className={`text-xs px-2 py-1 rounded transition-all ${
                    duration === v
                      ? 'bg-[#EAF3FF] text-[#1F8BFF] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#475569]'
                  }`}
                >
                  {v}s
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
