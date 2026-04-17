import { useRef } from 'react';
import { Upload, X, Image, Video } from 'lucide-react';
import type { GenerationMode } from '../../types';

interface UploadAreaProps {
  uploads: string[];
  mode: GenerationMode;
  onChange: (uploads: string[]) => void;
}

const MAX_UPLOADS = 6;

const modeDesc: Record<GenerationMode, string> = {
  'text-to-video': '上传参考图片或视频（可选，最多 6 个）',
  'image-to-video': '上传驱动图片（至少 1 张，最多 6 个）',
  'all-reference': '上传图片和视频参考素材（最多 6 个）',
};

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=200',
];

export default function UploadArea({ uploads, mode, onChange }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddDemo = () => {
    if (uploads.length >= MAX_UPLOADS) return;
    const next = SAMPLE_IMAGES.find(img => !uploads.includes(img));
    if (next) onChange([...uploads, next]);
  };

  const handleRemove = (idx: number) => {
    onChange(uploads.filter((_, i) => i !== idx));
  };

  const slots = Array.from({ length: MAX_UPLOADS });

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm font-semibold text-[#0F172A]">素材上传</label>
        <span className="text-xs text-[#94A3B8]">{uploads.length} / {MAX_UPLOADS}</span>
      </div>
      <p className="text-xs text-[#7B8CA8] mb-3 leading-relaxed">{modeDesc[mode]}</p>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((_, idx) => {
          const url = uploads[idx];
          return (
            <div
              key={idx}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                url
                  ? 'border-[#D8E2F0] hover:border-[#B6E7FF]'
                  : idx === uploads.length
                    ? 'border-dashed border-[#1F8BFF] bg-[#F5FAFF] cursor-pointer hover:bg-[#EAF3FF]'
                    : 'border-dashed border-[#E6EDF5] bg-[#F5F7FB]'
              }`}
              onClick={idx === uploads.length ? handleAddDemo : undefined}
            >
              {url ? (
                <>
                  <img
                    src={url}
                    alt={`upload-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[rgba(15,23,42,0.7)] flex items-center justify-center hover:bg-[rgba(239,68,68,0.9)] transition-colors"
                  >
                    <X size={10} className="text-white" />
                  </button>
                  <div className="absolute bottom-1 left-1">
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[rgba(15,23,42,0.6)] text-white text-[10px]">
                      <Image size={9} /> 图片
                    </span>
                  </div>
                </>
              ) : idx === uploads.length ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <Upload size={16} className="text-[#1F8BFF]" />
                  <span className="text-[10px] text-[#1F8BFF] font-medium">添加素材</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-0.5">
                    <Image size={12} className="text-[#D8E2F0]" />
                    <Video size={12} className="text-[#D8E2F0]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      <p className="text-xs text-[#94A3B8] mt-2">
        支持 JPG、PNG、GIF、MP4、MOV，单文件不超过 100MB
      </p>
    </div>
  );
}
