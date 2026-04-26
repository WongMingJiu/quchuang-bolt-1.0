import { useState } from 'react';
import { Info, X } from 'lucide-react';
import type { CreationFormState, Generation } from '../../types';
import PromptExpansionPanel from './PromptExpansionPanel';
import PromptInput from './PromptInput';
import UploadArea from './UploadArea';

interface CreationWorkspaceProps {
  form: CreationFormState;
  onFormChange: (updates: Partial<CreationFormState>) => void;
  onGenerate: () => void;
  generating: boolean;
  prefillSource?: Generation | null;
  onDismissPrefill: () => void;
  onMessage?: (message: string | null) => void;
}

const REQUIRED_MEDIA_LABELS = {
  'omni-reference': '全能参考支持图片、视频、音频混合参考，最多 9 个文件',
  'image-to-video-first-last': '图生视频-首尾帧必须上传 2 张图片',
  'image-to-video': '图生视频可上传最多 9 张图片',
  'text-to-video': '文生视频无需上传参考素材',
} as const;

export default function CreationWorkspace({
  form, onFormChange, onGenerate, generating, prefillSource, onDismissPrefill, onMessage,
}: CreationWorkspaceProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!form.prompt.trim()) errs.push('请输入提示词');
    if (form.media_uploads.length > 9) errs.push('上传素材不能超过 9 个');
    if (form.duration < 4 || form.duration > 15) errs.push('视频时长须在 4-15 秒之间');
    if (form.mode === 'image-to-video-first-last' && form.media_uploads.length !== 2) {
      errs.push(REQUIRED_MEDIA_LABELS['image-to-video-first-last']);
    }
    if (form.mode === 'image-to-video' && form.media_uploads.some(item => item.type !== 'image')) {
      errs.push('图生视频仅支持上传图片。');
    }
    if (form.mode === 'image-to-video-first-last' && form.media_uploads.some(item => item.type !== 'image')) {
      errs.push('图生视频-首尾帧仅支持上传图片。');
    }
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
        <p className="text-xs text-[#7B8CA8] mt-0.5">模型选择、生成模式选择和视频参数都已收拢到提示词输入框底部工具栏</p>
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

        <div className="rounded-3xl border border-[#E6EDF5] bg-white px-5 py-5 shadow-sm space-y-4">
          <PromptExpansionPanel onUsePrompt={(prompt) => onFormChange({ prompt })} />
          <PromptInput
            form={form}
            generating={generating}
            onChange={onFormChange}
            onGenerate={handleGenerate}
          />
          <UploadArea
            uploads={form.media_uploads}
            mode={form.mode}
            onChange={uploads => onFormChange({ media_uploads: uploads })}
            onMessage={onMessage}
          />
        </div>

        <div className="px-3 py-2 rounded-lg bg-white border border-[#E6EDF5] text-xs text-[#64748B]">
          当前模式说明：{REQUIRED_MEDIA_LABELS[form.mode]}
        </div>

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
    </div>
  );
}
