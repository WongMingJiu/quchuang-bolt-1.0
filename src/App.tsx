import { useState, useEffect, useCallback } from 'react';
import type { ActivePage, Generation } from './types';
import LeftNav from './components/layout/LeftNav';
import UserInfo from './components/layout/UserInfo';
import CreationPage from './pages/CreationPage';
import AssetsPage from './pages/AssetsPage';
import { fetchGenerations, toggleFavorite } from './lib/supabase';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('creation');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchGenerations()
      .then(setGenerations)
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleGenerationsChange = useCallback((updater: (prev: Generation[]) => Generation[]) => {
    setGenerations(prev => updater(prev));
  }, []);

  const handleToggleFavoriteAssets = async (id: string, current: boolean) => {
    try {
      await toggleFavorite(id, !current);
      setGenerations(prev => prev.map(g => g.id === id ? { ...g, is_favorited: !current } : g));
    } catch {
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FB]">
      <LeftNav activePage={activePage} onNavigate={setActivePage} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E6EDF5] flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#12D6FF] animate-pulse" />
              <span className="text-xs text-[#7B8CA8] font-medium">系统正常</span>
            </div>
          </div>
          <UserInfo />
        </header>

        <main className="flex-1 overflow-hidden">
          {activePage === 'creation' && (
            <CreationPage
              generations={generations}
              loadingHistory={loadingHistory}
              onGenerationsChange={handleGenerationsChange}
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
