import { Film, FolderOpen, Zap } from 'lucide-react';
import type { ActivePage } from '../../types';

interface LeftNavProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const navItems: { key: ActivePage; label: string; icon: React.ReactNode }[] = [
  { key: 'creation', label: '创作', icon: <Zap size={20} /> },
  { key: 'assets', label: '资产', icon: <FolderOpen size={20} /> },
];

export default function LeftNav({ activePage, onNavigate }: LeftNavProps) {
  return (
    <aside className="flex flex-col w-16 lg:w-56 h-full bg-[#0F172A] border-r border-[#1E293B] flex-shrink-0 transition-all duration-300">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#1E293B]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1F8BFF, #12D6FF)' }}>
          <Film size={16} className="text-white" />
        </div>
        <span className="hidden lg:block font-bold text-white text-sm tracking-wide truncate">AIGC Studio</span>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map(item => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left w-full ${
                isActive
                  ? 'bg-[#1F8BFF] text-white shadow-lg'
                  : 'text-[#7B8CA8] hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="hidden lg:block font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1E293B]">
        <div className="hidden lg:block px-3 py-2">
          <p className="text-[#475569] text-xs">V1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
