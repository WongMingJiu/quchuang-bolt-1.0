import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { AspectRatio, CreationFormState, GenerationMode, ModelType } from '../../types';
import ModeSelector from './ModeSelector';
import AdvancedSettings from './AdvancedSettings';

interface PromptInputProps {
  form: CreationFormState;
  generating: boolean;
  onChange: (updates: Partial<CreationFormState>) => void;
  onGenerate: () => void;
}

const MAX_LEN = 2000;

const modeLabelMap: Record<GenerationMode, string> = {
  'omni-reference': '全能参考',
  'image-to-video-first-last': '首尾帧',
  'image-to-video': '图生视频',
  'text-to-video': '文生视频',
};

const ratioLabelMap: Record<AspectRatio, string> = {
  '21:9': '21:9',
  '16:9': '16:9',
  '4:3': '4:3',
  '1:1': '1:1',
  '3:4': '3:4',
  '9:16': '9:16',
};

const modelLabelMap: Record<ModelType, string> = {
  'seedance2.0': 'Seedance 2.0',
};

export default function PromptInput({ form, generating, onChange, onGenerate }: PromptInputProps) {
  const [modeOpen, setModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (modeRef.current && !modeRef.current.contains(target)) setModeOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(target)) setSettingsOpen(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const summaryItems = useMemo(() => ([
    { label: '模型', value: modelLabelMap[form.model] },
    { label: '模式', value: modeLabelMap[form.mode] },
    { label: '比例', value: ratioLabelMap[form.aspect_ratio] },
    { label: '时长', value: `${form.duration}s` },
    { label: '声音', value: form.generate_audio ? '有声' : '静音' },
    { label: '水印', value: form.watermark ? '开启' : '关闭' },
  ]), [form.model, form.mode, form.aspect_ratio, form.duration, form.generate_audio, form.watermark]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm font-semibold text-[#0F172A]">提示词</label>
        <span className={`text-xs font-mono ${form.prompt.length > MAX_LEN * 0.9 ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`}>
          {form.prompt.length} / {MAX_LEN}
        </span>
      </div>

      <div className="rounded-[28px] border border-[#E6EDF5] bg-white shadow-sm transition-all duration-150 focus-within:border-[#1F8BFF] focus-within:ring-4 focus-within:ring-[rgba(31,139,255,0.08)]">
        <textarea
          value={form.prompt}
          onChange={e => onChange({ prompt: e.target.value.slice(0, MAX_LEN) })}
          placeholder="描述你想生成的视频内容，例如：一个未来城市的夜晚，霓虹灯倒映在雨后的街道上，行人撑着透明雨伞缓缓走过..."
          className="w-full resize-none rounded-t-[28px] bg-transparent px-5 py-5 text-sm leading-relaxed text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
          rows={7}
          style={{ minHeight: '180px' }}
        />

        <div className="border-t border-[#EEF3F8] bg-[#FAFBFC] px-4 py-3 rounded-b-[28px] space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E6EDF5] bg-white px-3 py-2.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">当前配置</span>
            <div className="h-4 w-px bg-[#E6EDF5]" />
            {summaryItems.map(item => (
              <div key={item.label} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]">
                <span className="text-[#94A3B8]">{item.label}</span>
                <span className="font-medium text-[#0F172A]">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative" ref={modeRef}>
                <button
                  type="button"
                  onClick={() => setModeOpen(v => !v)}
                  className="inline-flex min-w-[156px] items-center justify-between gap-2 rounded-xl border border-[#E6EDF5] bg-white px-3 py-2 text-sm text-[#334155] shadow-sm transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                >
                  <span className="text-[#94A3B8]">模式</span>
                  <span className="truncate font-medium text-[#0F172A]">{modeLabelMap[form.mode]}</span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${modeOpen ? 'rotate-180' : ''}`} />
                </button>

                {modeOpen && (
                  <div className="absolute left-0 top-full mt-2 z-30 w-[360px] rounded-2xl border border-[#E5EAF1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] overflow-hidden">
                    <div className="border-b border-[#EEF2F7] px-4 py-3">
                      <p className="text-sm font-semibold text-[#0F172A]">生成模式</p>
                      <p className="text-xs text-[#94A3B8] mt-1">根据素材形态选择合适的生成方式</p>
                    </div>
                    <div className="p-3">
                      <ModeSelector
                        value={form.mode}
                        onChange={mode => {
                          onChange({ mode, media_uploads: [] });
                          setModeOpen(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={settingsRef}>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(v => !v)}
                  className="inline-flex min-w-[220px] items-center justify-between gap-2 rounded-xl border border-[#E6EDF5] bg-white px-3 py-2 text-sm text-[#334155] shadow-sm transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                >
                  <span className="flex items-center gap-2 truncate">
                    <SlidersHorizontal size={14} className="text-[#1F8BFF]" />
                    <span className="text-[#94A3B8]">参数</span>
                  </span>
                  <span className="truncate font-medium text-[#0F172A]">{ratioLabelMap[form.aspect_ratio]} · {form.duration}s · {form.generate_audio ? '有声' : '静音'} · {form.watermark ? '水印开' : '无水印'}</span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 top-full mt-2 z-30 w-[420px] rounded-2xl border border-[#E5EAF1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] overflow-hidden">
                    <div className="border-b border-[#EEF2F7] px-4 py-3">
                      <p className="text-sm font-semibold text-[#0F172A]">视频参数</p>
                      <p className="text-xs text-[#94A3B8] mt-1">配置输出比例、时长和声音开关</p>
                    </div>
                    <AdvancedSettings
                      model={form.model}
                      generateAudio={form.generate_audio}
                      watermark={form.watermark}
                      aspectRatio={form.aspect_ratio}
                      duration={form.duration}
                      onModelChange={(model: ModelType) => onChange({ model })}
                      onGenerateAudioChange={generateAudio => onChange({ generate_audio: generateAudio })}
                      onWatermarkChange={watermark => onChange({ watermark })}
                      onAspectRatioChange={(aspectRatio: AspectRatio) => onChange({ aspect_ratio: aspectRatio })}
                      onDurationChange={duration => onChange({ duration })}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#1F8BFF] px-5 text-sm font-semibold text-white transition-all hover:bg-[#1677FF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  提交中
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  立即生成
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
