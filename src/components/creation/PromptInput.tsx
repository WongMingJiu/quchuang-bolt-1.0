interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
}

const MAX_LEN = 2000;
const SUGGESTIONS = ['电影感', '慢镜头', '4K画质', '日落', '城市风光', '史诗级', '科幻'];

export default function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm font-semibold text-[#0F172A]">提示词</label>
        <span className={`text-xs font-mono ${value.length > MAX_LEN * 0.9 ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`}>
          {value.length} / {MAX_LEN}
        </span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, MAX_LEN))}
        placeholder="描述你想生成的视频内容，例如：一个未来城市的夜晚，霓虹灯倒映在雨后的街道上，行人撑着透明雨伞缓缓走过..."
        className="form-input resize-none leading-relaxed text-sm"
        rows={5}
        style={{ minHeight: '120px' }}
      />
      {value.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-xs text-[#94A3B8] mr-1 self-center">快速标签：</span>
          {SUGGESTIONS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(tag + ' ')}
              className="tag cursor-pointer hover:bg-[#EAF3FF] hover:text-[#1F8BFF] transition-colors duration-150"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
