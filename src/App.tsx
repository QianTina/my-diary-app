import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import WritePage from './pages/WritePage';
import DiaryDetailPage from './pages/DiaryDetailPage';
import SettingsPage from './pages/SettingsPage';
import StatsPage from './pages/StatsPage';
import ArchivePage from './pages/ArchivePage';
import LoginPage from './pages/auth/LoginPage';
import { ProfilePage } from './pages/auth/ProfilePage';
import { useAuthStore } from './store/authStore';

function App() {
  const { initialize } = useAuthStore();

  // 初始化认证状态
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 公共路由 - 登录页面 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 受保护的路由 - 需要认证 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="write" element={<WritePage />} />
            <Route path="diary/:id" element={<DiaryDetailPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
