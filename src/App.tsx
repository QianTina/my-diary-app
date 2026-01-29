import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import WritePage from './pages/WritePage';
import DiaryDetailPage from './pages/DiaryDetailPage';
import SettingsPage from './pages/SettingsPage';
import StatsPage from './pages/StatsPage';
import ArchivePage from './pages/ArchivePage';
import SearchPage from './pages/SearchPage';
import CalendarPage from './pages/CalendarPage';
import TaskTestPage from './pages/TaskTestPage';
import TaskManagementPage from './pages/TaskManagementPage';
import NotebookTestPage from './pages/NotebookTestPage';
import NotebookListPage from './pages/NotebookListPage';
import NotebookReaderPage from './pages/NotebookReaderPage';
import LoginPage from './pages/auth/LoginPage';
import { ProfilePage } from './pages/auth/ProfilePage';
import { useAuthStore } from './store/authStore';

// 键盘快捷键组件
function KeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) 或 Ctrl+K (Windows/Linux) 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

function App() {
  const { initialize } = useAuthStore();

  // 初始化认证状态
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <KeyboardShortcuts />
        <Routes>
        {/* 公共路由 - 登录页面 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 受保护的路由 - 需要认证 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="write" element={<WritePage />} />
            <Route path="diary/:id" element={<DiaryDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="tasks" element={<TaskManagementPage />} />
            <Route path="tasks-test" element={<TaskTestPage />} />
            <Route path="notebook-test" element={<NotebookTestPage />} />
            <Route path="notebooks" element={<NotebookListPage />} />
            <Route path="notebooks/:notebookId" element={<NotebookReaderPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
