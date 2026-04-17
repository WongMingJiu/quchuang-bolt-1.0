import { useState, useEffect, useCallback } from 'react';
import type { ActivePage, Generation } from './types';
import LeftNav from './components/layout/LeftNav';
import UserInfo from './components/layout/UserInfo';
import CreationPage from './pages/CreationPage';
import AssetsPage from './pages/AssetsPage';
import { fetchGenerations, isUsingDemoMode, toggleFavorite } from './lib/supabase';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('creation');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(
    isUsingDemoMode() ? '当前为本地演示模式；请配置 Supabase 环境变量后再进行正式发布。' : null,
  );

  useEffect(() => {
    fetchGenerations()
      .then(data => {
        setGenerations(data);
        setHistoryError(null);
      })
      .catch((error: unknown) => {
        console.error(error);
        setHistoryError(error instanceof Error ? error.message : '历史记录加载失败，请稍后重试。');
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleGenerationsChange = useCallback((updater: (prev: Generation[]) => Generation[]) => {
    setGenerations(prev => updater(prev));
  }, []);

  const handleToggleFavoriteAssets = async (id: string, current: boolean) => {
    try {
      await toggleFavorite(id, !current);
      setGenerations(prev => prev.map(g => g.id === id ? { ...g, is_favorited: !current } : g));
      setBannerMessage(null);
    } catch (error) {
      setBannerMessage(error instanceof Error ? error.message : '收藏状态更新失败，请稍后重试。');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FB]">
      <LeftNav activePage={activePage} onNavigate={setActivePage} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E6EDF5] flex-shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#12D6FF] animate-pulse" />
              <span className="text-xs text-[#7B8CA8] font-medium">系统正常</span>
            </div>
            {bannerMessage && (
              <div className="px-3 py-1.5 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-xs text-[#C2410C] max-w-[520px] truncate">
                {bannerMessage}
              </div>
            )}
          </div>
          <UserInfo />
        </header>

        {historyError && (
          <div className="mx-5 mt-4 px-4 py-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
            {historyError}
          </div>
        )}

        <main className="flex-1 overflow-hidden">
          {activePage === 'creation' && (
            <CreationPage
              generations={generations}
              loadingHistory={loadingHistory}
              onGenerationsChange={handleGenerationsChange}
              onMessage={setBannerMessage}
            />
          )}
          {activePage === 'assets' && (
            <AssetsPage
              generations={generations}
              onToggleFavorite={handleToggleFavoriteAssets}
            />
          )}
        </main>
      </div>
    </div>
  );
}
