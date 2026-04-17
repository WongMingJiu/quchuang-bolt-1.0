import { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';
import type { CreationFormState, Generation } from '../../types';
import PromptInput from './PromptInput';
import UploadArea from './UploadArea';
import ModeSelector from './ModeSelector';
import AdvancedSettings from './AdvancedSettings';

interface CreationWorkspaceProps {
  form: CreationFormState;
  onFormChange: (updates: Partial<CreationFormState>) => void;
  onGenerate: () => void;
  generating: boolean;
  prefillSource?: Generation | null;
  onDismissPrefill: () => void;
}

export default function CreationWorkspace({
  form, onFormChange, onGenerate, generating, prefillSource, onDismissPrefill
}: CreationWorkspaceProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!form.prompt.trim()) errs.push('请输入提示词');
    if (form.media_uploads.length > 6) errs.push('上传素材不能超过 6 个');
    if (form.duration < 5 || form.duration > 15) errs.push('视频时长须在 5-15 秒之间');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    setErrors([]);
    onGenerate();
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      <div className="px-6 py-4 border-b border-[#E6EDF5] bg-white flex-shrink-0">
        <h1 className="text-base font-bold text-[#0F172A]">创作工作台</h1>
        <p className="text-xs text-[#7B8CA8] mt-0.5">输入提示词或上传素材，开始 AI 视频创作</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {prefillSource && (
          <div className="flex items-start gap-3 px-4 py-3 bg-[#EAF3FF] border border-[#B6E7FF] rounded-lg animate-fade-in">
            <Info size={15} className="text-[#1F8BFF] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1F8BFF] font-medium">已载入历史任务</p>
              <p className="text-xs text-[#4AA3FF] mt-0.5 truncate">
                {prefillSource.prompt.slice(0, 60)}{prefillSource.prompt.length > 60 ? '...' : ''}
              </p>
            </div>
            <button
              onClick={onDismissPrefill}
              className="text-[#4AA3FF] hover:text-[#1F8BFF] transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <PromptInput value={form.prompt} onChange={v => onFormChange({ prompt: v })} />

        <UploadArea
          uploads={form.media_uploads}
          mode={form.mode}
          onChange={uploads => onFormChange({ media_uploads: uploads })}
        />

        <ModeSelector value={form.mode} onChange={mode => onFormChange({ mode })} />

        <AdvancedSettings
          model={form.model}
          aspectRatio={form.aspect_ratio}
          duration={form.duration}
          onModelChange={model => onFormChange({ model })}
          onAspectRatioChange={aspect_ratio => onFormChange({ aspect_ratio })}
          onDurationChange={duration => onFormChange({ duration })}
        />

        {errors.length > 0 && (
          <div className="space-y-1.5 animate-fade-in">
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#EF4444]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0" />
                {err}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-[#E6EDF5] bg-white flex-shrink-0">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base h-12 rounded-lg"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              正在生成...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              立即生成
            </>
          )}
        </button>
      </div>
    </div>
  );
}
