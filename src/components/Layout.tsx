import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDiaryStore } from '../store/diaryStore';

export default function Layout() {
  const { fetchDiaries } = useDiaryStore();
  const location = useLocation();

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/write', icon: '✍️', label: '写作' },
    { path: '/settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-2">
              <span className="text-2xl">📝</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                智能日记
              </span>
            </NavLink>

            {/* 导航菜单 */}
            <nav className="flex space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* 底部信息 */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>用心记录，感受生活 ✨</p>
      </footer>
    </div>
  );
}
