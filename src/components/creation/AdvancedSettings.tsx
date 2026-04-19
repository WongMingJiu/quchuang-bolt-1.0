import { MonitorPlay, Clock, Volume2, ShieldCheck } from 'lucide-react';
import type { ModelType, AspectRatio } from '../../types';

interface AdvancedSettingsProps {
  model: ModelType;
  generateAudio: boolean;
  watermark: boolean;
  aspectRatio: AspectRatio;
  duration: number;
  onModelChange: (v: ModelType) => void;
  onGenerateAudioChange: (value: boolean) => void;
  onWatermarkChange: (value: boolean) => void;
  onAspectRatioChange: (v: AspectRatio) => void;
  onDurationChange: (v: number) => void;
}

const RATIOS: { key: AspectRatio; label: string; icon: string }[] = [
  { key: '21:9', label: '21:9', icon: '▬' },
  { key: '16:9', label: '16:9', icon: '▬' },
  { key: '4:3', label: '4:3', icon: '▬' },
  { key: '1:1', label: '1:1', icon: '■' },
  { key: '3:4', label: '3:4', icon: '▮' },
  { key: '9:16', label: '9:16', icon: '▮' },
];

export default function AdvancedSettings({
  generateAudio,
  watermark,
  aspectRatio,
  duration,
  onGenerateAudioChange,
  onWatermarkChange,
  onAspectRatioChange,
  onDurationChange,
}: AdvancedSettingsProps) {
  return (
    <div className="bg-white p-4 space-y-5">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <MonitorPlay size={14} className="text-[#7B8CA8]" />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">画面比例</p>
            <p className="text-xs text-[#94A3B8]">根据投放平台选择合适的宽高比</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
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
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#7B8CA8]" />
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">视频时长</p>
              <p className="text-xs text-[#94A3B8]">当前输出时长为 {duration}s</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#94A3B8] w-6">4s</span>
          <input
            type="range"
            min={4}
            max={15}
            step={1}
            value={duration}
            onChange={e => onDurationChange(Number(e.target.value))}
            className="flex-1 h-1.5 appearance-none cursor-pointer rounded-full"
            style={{
              background: `linear-gradient(to right, #1F8BFF ${((duration - 4) / 11) * 100}%, #E6EDF5 ${((duration - 4) / 11) * 100}%)`,
            }}
          />
          <span className="text-xs text-[#94A3B8] w-6">15s</span>
        </div>
        <div className="flex justify-between">
          {[4, 5, 8, 10, 12, 15].map(v => (
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
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Volume2 size={14} className="text-[#7B8CA8]" />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">声音设置</p>
            <p className="text-xs text-[#94A3B8]">决定是否为生成结果保留音频</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onGenerateAudioChange(!generateAudio)}
          className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all ${
            generateAudio
              ? 'border-[#1F8BFF] bg-[#EAF3FF] text-[#1F8BFF]'
              : 'border-[#E6EDF5] bg-[#F8FAFC] text-[#475569]'
          }`}
        >
          <span>{generateAudio ? '有声音' : '无声音'}</span>
          <span className="text-xs font-medium">{generateAudio ? '保留音频输出' : '生成静音视频'}</span>
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#7B8CA8]" />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">水印设置</p>
            <p className="text-xs text-[#94A3B8]">控制结果视频是否附带默认水印</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onWatermarkChange(!watermark)}
          className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all ${
            watermark
              ? 'border-[#1F8BFF] bg-[#EAF3FF] text-[#1F8BFF]'
              : 'border-[#E6EDF5] bg-[#F8FAFC] text-[#475569]'
          }`}
        >
          <span>{watermark ? '显示水印' : '无水印'}</span>
          <span className="text-xs font-medium">{watermark ? 'watermark = true' : 'watermark = false'}</span>
        </button>
      </section>
    </div>
  );
}
