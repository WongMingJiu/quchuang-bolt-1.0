import { useRef, useState } from 'react';
import { Upload, X, Image, Video, Loader2, Music4, FolderOpenDot, Flag } from 'lucide-react';
import type { GenerationAsset, GenerationMode, MediaType } from '../../types';
import { uploadGenerationAsset } from '../../lib/supabase';

interface UploadAreaProps {
  uploads: GenerationAsset[];
  mode: GenerationMode;
  onChange: (uploads: GenerationAsset[]) => void;
  onMessage?: (message: string | null) => void;
}

const MAX_UPLOADS = 9;

const modeDesc: Record<GenerationMode, string> = {
  'omni-reference': '支持图片、视频、音频混合上传，最多 9 个文件',
  'image-to-video-first-last': '必须上传 2 张图片，分别作为首帧和尾帧',
  'image-to-video': '支持上传最多 9 张图片作为参考',
  'text-to-video': '文生视频无需上传参考物料',
};

const ACCEPT_RULES = {
  image: '.jpeg,.jpg,.png,.webp,.bmp,.tiff,.gif',
  video: '.mp4,.mov',
  audio: '.wav,.mp3',
};

function getAccept(mode: GenerationMode) {
  if (mode === 'image-to-video' || mode === 'image-to-video-first-last') return ACCEPT_RULES.image;
  if (mode === 'omni-reference') return [ACCEPT_RULES.image, ACCEPT_RULES.video, ACCEPT_RULES.audio].join(',');
  return '';
}

function getMediaType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.wav') || lowerName.endsWith('.mp3')) return 'audio';
  if (lowerName.endsWith('.mp4') || lowerName.endsWith('.mov')) return 'video';
  return 'image';
}

const assetIcons: Record<MediaType, JSX.Element> = {
  image: <Image size={14} className="text-[#1F8BFF]" />,
  video: <Video size={14} className="text-[#1F8BFF]" />,
  audio: <Music4 size={14} className="text-[#1F8BFF]" />,
};

const assetTypeLabel: Record<MediaType, string> = {
  image: '图片',
  video: '视频',
  audio: '音频',
};

function getFrameTag(mode: GenerationMode, index: number) {
  if (mode !== 'image-to-video-first-last') return null;
  return index === 0 ? '首帧' : index === 1 ? '尾帧' : null;
}

function withSemanticRoles(mode: GenerationMode, assets: GenerationAsset[]): GenerationAsset[] {
  if (mode === 'image-to-video-first-last') {
    return assets.map((asset, index): GenerationAsset => ({
      ...asset,
      role: index === 0 ? 'start_frame' : index === 1 ? 'end_frame' : 'reference_image',
    }));
  }

  if (mode === 'omni-reference') {
    return assets.map((asset): GenerationAsset => ({
      ...asset,
      role: asset.type === 'image'
        ? 'reference_image'
        : asset.type === 'video'
          ? 'reference_video'
          : 'reference_audio',
    }));
  }

  if (mode === 'image-to-video') {
    return assets.map((asset): GenerationAsset => ({ ...asset, role: 'reference_image' }));
  }

  return assets;
}

export default function UploadArea({ uploads, mode, onChange, onMessage }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (mode === 'text-to-video') {
    return null;
  }

  const handleOpenPicker = () => {
    if (uploads.length >= MAX_UPLOADS || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemove = (idx: number) => {
    onChange(uploads.filter((_, i) => i !== idx));
  };

  const validateFile = (file: File) => {
    const type = getMediaType(file);

    if ((mode === 'image-to-video' || mode === 'image-to-video-first-last') && type !== 'image') {
      throw new Error('当前模式下只能上传图片。');
    }

    if (mode === 'omni-reference' && !['image', 'video', 'audio'].includes(type)) {
      throw new Error('全能参考模式仅支持图片、视频、音频。');
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const limit = mode === 'image-to-video-first-last' ? 2 : MAX_UPLOADS;
    const files = Array.from(fileList).slice(0, limit - uploads.length);
    setUploading(true);
    onMessage?.('正在上传参考素材，请稍候。');

    try {
      const nextAssets: GenerationAsset[] = [];
      for (const file of files) {
        validateFile(file);
        const asset = await uploadGenerationAsset(file);
        nextAssets.push(asset);
      }
      onChange(withSemanticRoles(mode, [...uploads, ...nextAssets].slice(0, limit)));
      onMessage?.(`已上传 ${nextAssets.length} 个素材。`);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : '素材上传失败，请稍后重试。');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const currentMax = mode === 'image-to-video-first-last' ? 2 : MAX_UPLOADS;

  return (
    <div className="rounded-2xl border border-[#E6EDF5] bg-[#FBFCFE] px-4 py-4">
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#EEF2F7] pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FolderOpenDot size={15} className="text-[#7B8CA8]" />
            <span className="text-sm font-semibold text-[#0F172A]">参考资产</span>
            <span className="text-xs text-[#94A3B8]">{uploads.length} / {currentMax}</span>
          </div>
          <p className="text-xs text-[#7B8CA8] mt-1">{modeDesc[mode]}</p>
        </div>

        <button
          type="button"
          onClick={handleOpenPicker}
          disabled={uploads.length >= currentMax || uploading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#D8E2F0] bg-white px-3 py-2 text-sm text-[#475569] shadow-sm transition-all hover:border-[#B6E7FF] hover:bg-[#F5F9FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin text-[#1F8BFF]" /> : <Upload size={14} className="text-[#1F8BFF]" />}
          {uploading ? '上传中' : '添加资产'}
        </button>
      </div>

      {uploads.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {uploads.map((asset, idx) => {
            const frameTag = getFrameTag(mode, idx) ?? (asset.role === 'reference_audio' ? '音频参考' : asset.role === 'reference_video' ? '视频参考' : asset.role === 'reference_image' ? '图片参考' : null);
            return (
              <div key={`${asset.path}-${idx}`} className="flex items-center gap-3 rounded-xl border border-[#E6EDF5] bg-white px-3 py-2.5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F9FF] border border-[#EAF2FF] shrink-0 overflow-hidden">
                  {asset.type === 'image' ? (
                    <img src={asset.publicUrl} alt={asset.name} className="h-full w-full rounded-xl object-cover" />
                  ) : assetIcons[asset.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap">
                    {assetIcons[asset.type]}
                    <span>{assetTypeLabel[asset.type]}</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span>{Math.max(1, Math.round(asset.size / 1024))} KB</span>
                    {frameTag && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-medium text-[#1F5FFF]">
                        <Flag size={10} />
                        {frameTag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-[#0F172A]">{asset.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="rounded-full p-1.5 text-[#94A3B8] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-[#D8E2F0] bg-white px-4 py-5 text-center text-sm text-[#94A3B8]">
          暂未添加参考资产，点击右上角“添加资产”开始上传。
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={getAccept(mode)}
        multiple={mode !== 'image-to-video-first-last' || uploads.length < 1}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
