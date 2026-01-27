import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDiaryStore } from '../store/diaryStore';
import { useThemeStore } from '../store/themeStore';
import Sidebar from './Sidebar';

export default function Layout() {
  const { fetchDiaries } = useDiaryStore();
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
