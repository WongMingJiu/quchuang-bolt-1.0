import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import type { ModelQuota } from '../../types';

const quotas: ModelQuota[] = [
  { model: 'seedance2.0', label: 'Seedance 2.0', remaining: 278, total: 500 },
];

const totalRemaining = quotas.reduce((a, b) => a + b.remaining, 0);

export default function UserInfo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#EEF4FA] transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1F8BFF, #12D6FF)' }}>
          A
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium text-[#0F172A]">创作者</span>
          <span className="text-xs text-[#7B8CA8] flex items-center gap-1">
            <Zap size={10} className="text-[#12D6FF]" />
            剩余 {totalRemaining} 次
          </span>
        </div>
        <ChevronDown size={14} className={`text-[#94A3B8] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-elevated border border-[#E6EDF5] z-50 animate-fade-in overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E6EDF5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #1F8BFF, #12D6FF)' }}>
                A
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">创作者</p>
                <p className="text-xs text-[#7B8CA8]">creator@aigc.studio</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-[#7B8CA8] uppercase tracking-wider mb-3">模型剩余次数</p>
            <div className="space-y-3">
              {quotas.map(q => (
                <div key={q.model}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#475569]">{q.label}</span>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      {q.remaining}
                      <span className="text-xs text-[#94A3B8] font-normal"> / {q.total}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#EEF4FA] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(q.remaining / q.total) * 100}%`,
                        background: q.remaining / q.total > 0.3
                          ? 'linear-gradient(90deg, #1F8BFF, #12D6FF)'
                          : 'linear-gradient(90deg, #F59E0B, #EF4444)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-2.5 bg-[#F5F7FB] border-t border-[#E6EDF5]">
            <button className="text-xs text-[#1F8BFF] hover:text-[#4AA3FF] font-medium transition-colors">
              购买更多次数 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
