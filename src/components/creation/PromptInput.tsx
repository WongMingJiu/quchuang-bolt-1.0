import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal, Sparkles, Image as ImageIcon, Video, Music4, Briefcase } from 'lucide-react';
import type { AspectRatio, CategoryType, CreationFormState, GenerationAsset, GenerationMode, ModelType, StoryboardType } from '../../types';
import ModeSelector from './ModeSelector';
import AdvancedSettings from './AdvancedSettings';
import { uploadFilesToAssets } from './UploadArea';

interface PromptInputProps {
  form: CreationFormState;
  generating: boolean;
  onChange: (updates: Partial<CreationFormState>) => void;
  onGenerate: () => void;
}

const MAX_LEN = 2000;
const CATEGORY_OPTIONS: CategoryType[] = ['太极', '唱歌', '瑜伽', '普拉提', '手机摄影'];
const STORYBOARD_OPTIONS: StoryboardType[] = ['口播类', '情景类', 'IP代练'];

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHighlightedPrompt(prompt: string, assets: GenerationAsset[]) {
  let html = escapeHtml(prompt);
  for (const asset of assets) {
    const mention = `@${asset.displayName}`;
    const escapedMention = escapeHtml(mention);
    const label = escapeHtml(asset.displayName);
    html = html.replace(
      new RegExp(escapedMention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `<span class="mention-chip">${label}</span>`,
    );
  }

  return html.replace(/\n/g, '<br />');
}

function getAssetIcon(asset: GenerationAsset) {
  if (asset.type === 'image') {
    return asset.publicUrl ? <img src={asset.publicUrl} alt={asset.displayName} className="h-8 w-8 rounded-lg object-cover" /> : <ImageIcon size={14} />;
  }
  if (asset.type === 'video') {
    return asset.publicUrl ? <video src={asset.publicUrl} className="h-8 w-8 rounded-lg object-cover" muted playsInline /> : <Video size={14} />;
  }
  return <Music4 size={14} className="text-[#1F8BFF]" />;
}

function getMentionTokenAtCursor(prompt: string, cursor: number) {
  const prefix = prompt.slice(0, cursor);
  const match = prefix.match(/(^|\s)(@[^\s]+)$/);
  if (!match) return null;
  const token = match[2];
  const start = cursor - token.length;
  return { token, start, end: cursor };
}

export default function PromptInput({ form, generating, onChange, onGenerate }: PromptInputProps) {
  const [modeOpen, setModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const modeRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);
  const mentionItemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (modeRef.current && !modeRef.current.contains(target)) setModeOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(target)) setSettingsOpen(false);
      if (businessRef.current && !businessRef.current.contains(target)) setBusinessOpen(false);
      if (mentionRef.current && !mentionRef.current.contains(target)) setMentionOpen(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const summaryItems = useMemo(() => ([
    { label: '模型', value: modelLabelMap[form.model] },
    { label: '模式', value: modeLabelMap[form.mode] },
    { label: '品类', value: form.category },
    { label: '分镜', value: form.storyboard_type },
    { label: '比例', value: ratioLabelMap[form.aspect_ratio] },
    { label: '时长', value: `${form.duration}s` },
    { label: '声音', value: form.generate_audio ? '有声' : '静音' },
    { label: '水印', value: form.watermark ? '开启' : '关闭' },
  ]), [form.model, form.mode, form.category, form.storyboard_type, form.aspect_ratio, form.duration, form.generate_audio, form.watermark]);

  const filteredAssets = useMemo(() => {
    if (!mentionFilter) return form.media_uploads;
    return form.media_uploads.filter(asset => asset.displayName.includes(mentionFilter));
  }, [form.media_uploads, mentionFilter]);

  const highlightedPrompt = useMemo(() => renderHighlightedPrompt(form.prompt, form.media_uploads), [form.prompt, form.media_uploads]);

  useEffect(() => {
    setActiveMentionIndex(0);
  }, [mentionFilter, mentionOpen]);

  useEffect(() => {
    if (!mentionOpen) return;
    const activeItem = mentionItemsRef.current[activeMentionIndex];
    activeItem?.scrollIntoView({ block: 'nearest' });
  }, [activeMentionIndex, mentionOpen]);

  const syncOverlayScroll = () => {
    if (!textareaRef.current || !overlayRef.current) return;
    overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  const replaceRange = (start: number, end: number, value: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const nextValue = `${form.prompt.slice(0, start)}${value}${form.prompt.slice(end)}`;
    onChange({ prompt: nextValue.slice(0, MAX_LEN) });
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + value.length;
      textarea.setSelectionRange(cursor, cursor);
      syncOverlayScroll();
    });
  };

  const insertAtCursor = (value: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    replaceRange(textarea.selectionStart, textarea.selectionEnd, value);
  };

  const insertMention = (asset: GenerationAsset) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const tokenInfo = getMentionTokenAtCursor(form.prompt, cursor);
    const replacement = `@${asset.displayName} `;

    if (!tokenInfo) {
      insertAtCursor(replacement);
    } else {
      replaceRange(tokenInfo.start, tokenInfo.end, replacement);
    }

    setMentionOpen(false);
    setMentionFilter('');
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(event.clipboardData.items).map(item => item.getAsFile()).filter((file): file is File => Boolean(file));
    if (files.length === 0) return;
    event.preventDefault();

    try {
      const nextUploads = await uploadFilesToAssets({ files, uploads: form.media_uploads, mode: form.mode });
      const insertedAssets = nextUploads.slice(form.media_uploads.length);
      onChange({ media_uploads: nextUploads });
      insertedAssets.forEach(asset => insertAtCursor(`@${asset.displayName} `));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePromptChange = (value: string) => {
    const nextValue = value.slice(0, MAX_LEN);
    onChange({ prompt: nextValue });
    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? nextValue.length;
    const prefix = nextValue.slice(0, cursor);
    const atIndex = prefix.lastIndexOf('@');

    if (atIndex >= 0 && (atIndex === 0 || /\s/.test(prefix[atIndex - 1] ?? ' '))) {
      const query = prefix.slice(atIndex + 1);
      if (!query.includes(' ')) {
        setMentionFilter(query);
        setMentionOpen(form.media_uploads.length > 0);
        return;
      }
    }

    setMentionOpen(false);
    setMentionFilter('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen && filteredAssets.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveMentionIndex(prev => (prev + 1) % filteredAssets.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveMentionIndex(prev => (prev - 1 + filteredAssets.length) % filteredAssets.length);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        insertMention(filteredAssets[activeMentionIndex]);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setMentionOpen(false);
        setMentionFilter('');
        return;
      }
    }

    if ((event.key === 'Backspace' || event.key === 'Delete') && textareaRef.current) {
      const textarea = textareaRef.current;
      const cursor = textarea.selectionStart;
      if (textarea.selectionStart === textarea.selectionEnd) {
        const tokenInfo = getMentionTokenAtCursor(form.prompt, cursor);
        if (tokenInfo && form.media_uploads.some(asset => `@${asset.displayName}` === tokenInfo.token)) {
          event.preventDefault();
          replaceRange(tokenInfo.start, tokenInfo.end + (form.prompt[tokenInfo.end] === ' ' ? 1 : 0), '');
        }
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm font-semibold text-[#0F172A]">提示词</label>
        <span className={`text-xs font-mono ${form.prompt.length > MAX_LEN * 0.9 ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`}>{form.prompt.length} / {MAX_LEN}</span>
      </div>

      <div className="rounded-[28px] border border-[#E6EDF5] bg-white shadow-sm transition-all duration-150 focus-within:border-[#1F8BFF] focus-within:ring-4 focus-within:ring-[rgba(31,139,255,0.08)]">
        <div className="relative" ref={mentionRef}>
          <div ref={overlayRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden px-5 py-5 text-sm leading-relaxed whitespace-pre-wrap break-words text-[#0F172A] opacity-0" dangerouslySetInnerHTML={{ __html: highlightedPrompt || '&nbsp;' }} style={{ minHeight: '180px' }} />
          <textarea
            ref={textareaRef}
            value={form.prompt}
            onChange={e => handlePromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onScroll={syncOverlayScroll}
            placeholder="描述你想生成的视频内容，支持直接粘贴图片/视频/音频文件，并输入 @ 引用已上传资产..."
            className="relative z-10 w-full resize-none rounded-t-[28px] bg-transparent px-5 py-5 text-sm leading-relaxed text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            rows={7}
            style={{ minHeight: '180px', caretColor: '#0F172A' }}
          />

          <style>{`
            .mention-chip { display: inline-flex; align-items: center; border-radius: 10px; background: rgba(31, 139, 255, 0.12); color: #1f5fff; padding: 1px 8px; font-weight: 600; }
          `}</style>

          {mentionOpen && filteredAssets.length > 0 && (
            <div className="absolute left-4 top-4 z-40 w-[320px] rounded-2xl border border-[#E5EAF1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] overflow-hidden">
              <div className="border-b border-[#EEF2F7] px-4 py-3">
                <p className="text-sm font-semibold text-[#0F172A]">引用参考资产</p>
                <p className="text-xs text-[#94A3B8] mt-1">输入 @ 后从已上传资产中选择</p>
              </div>
              <div className="max-h-[260px] overflow-y-auto p-2">
                {filteredAssets.map((asset, index) => (
                  <button
                    key={asset.path}
                    ref={element => { mentionItemsRef.current[index] = element; }}
                    type="button"
                    onClick={() => insertMention(asset)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all ${index === activeMentionIndex ? 'bg-[#EEF4FF]' : 'hover:bg-[#F8FAFC]'}`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F9FF] border border-[#EAF2FF] shrink-0 overflow-hidden">
                      {getAssetIcon(asset)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{asset.displayName}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{asset.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
                <button type="button" onClick={() => setModeOpen(v => !v)} className="inline-flex min-w-[156px] items-center justify-between gap-2 rounded-xl border border-[#E6EDF5] bg-white px-3 py-2 text-sm text-[#334155] shadow-sm transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC]">
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
                      <ModeSelector value={form.mode} onChange={mode => { onChange({ mode, media_uploads: [] }); setModeOpen(false); }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={settingsRef}>
                <button type="button" onClick={() => setSettingsOpen(v => !v)} className="inline-flex min-w-[220px] items-center justify-between gap-2 rounded-xl border border-[#E6EDF5] bg-white px-3 py-2 text-sm text-[#334155] shadow-sm transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC]">
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
                    <AdvancedSettings model={form.model} generateAudio={form.generate_audio} watermark={form.watermark} aspectRatio={form.aspect_ratio} duration={form.duration} onModelChange={(model: ModelType) => onChange({ model })} onGenerateAudioChange={generateAudio => onChange({ generate_audio: generateAudio })} onWatermarkChange={watermark => onChange({ watermark })} onAspectRatioChange={(aspectRatio: AspectRatio) => onChange({ aspect_ratio: aspectRatio })} onDurationChange={duration => onChange({ duration })} />
                  </div>
                )}
              </div>

              <div className="relative" ref={businessRef}>
                <button type="button" onClick={() => setBusinessOpen(v => !v)} className="inline-flex min-w-[220px] items-center justify-between gap-2 rounded-xl border border-[#E6EDF5] bg-white px-3 py-2 text-sm text-[#334155] shadow-sm transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC]">
                  <span className="flex items-center gap-2 truncate">
                    <Briefcase size={14} className="text-[#1F8BFF]" />
                    <span className="text-[#94A3B8]">业务参数</span>
                  </span>
                  <span className="truncate font-medium text-[#0F172A]">{form.category} · {form.storyboard_type}</span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${businessOpen ? 'rotate-180' : ''}`} />
                </button>
                {businessOpen && (
                  <div className="absolute right-0 top-full mt-2 z-30 w-[380px] rounded-2xl border border-[#E5EAF1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] overflow-hidden">
                    <div className="border-b border-[#EEF2F7] px-4 py-3">
                      <p className="text-sm font-semibold text-[#0F172A]">业务参数</p>
                      <p className="text-xs text-[#94A3B8] mt-1">配置所属品类与分镜类型</p>
                    </div>
                    <div className="p-4 space-y-4 bg-white">
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">所属品类</label>
                        <select value={form.category} onChange={e => onChange({ category: e.target.value as CategoryType })} className="w-full rounded-xl border border-[#E6EDF5] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#1F8BFF]">
                          {CATEGORY_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-2">分镜类型</label>
                        <select value={form.storyboard_type} onChange={e => onChange({ storyboard_type: e.target.value as StoryboardType })} className="w-full rounded-xl border border-[#E6EDF5] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#1F8BFF]">
                          {STORYBOARD_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={onGenerate} disabled={generating} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#1F8BFF] px-5 text-sm font-semibold text-white transition-all hover:bg-[#1677FF] disabled:cursor-not-allowed disabled:opacity-60">
              {generating ? (<><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />提交中</>) : (<><Sparkles size={16} />立即生成</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
