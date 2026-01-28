import { NavLink } from 'react-router-dom';
import { Home, PenLine, Archive, BarChart3, Settings, Sparkles, Search, Calendar, TestTube2, CheckSquare } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { UserMenu } from './UserMenu';

export default function Sidebar() {
  const isDark = useThemeStore((state) => state.isDark);
  
  const navItems = [
    { path: '/', icon: Home, label: '动态', enLabel: 'Dashboard' },
    { path: '/write', icon: PenLine, label: '写作', enLabel: 'Write' },
    { path: '/tasks', icon: CheckSquare, label: '任务', enLabel: 'Tasks' },
    { path: '/search', icon: Search, label: '搜索', enLabel: 'Search' },
    { path: '/calendar', icon: Calendar, label: '日历', enLabel: 'Calendar' },
    { path: '/archive', icon: Archive, label: '归档', enLabel: 'Archive' },
    { path: '/stats', icon: BarChart3, label: '统计', enLabel: 'Stats' },
    { path: '/tasks-test', icon: TestTube2, label: '任务测试', enLabel: 'Tasks Test' },
  ];

  return (
    <aside className={`w-64 flex flex-col h-screen fixed left-0 top-0 ${
      isDark ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700 border-r border-gray-200'
    }`}>
      {/* Logo */}
      <div className={`p-6 ${isDark ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Sparkles className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tina's Log</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? isDark 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-purple-50 text-purple-700'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.enLabel}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={`p-4 ${isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-purple-50 text-purple-700'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-medium">设置</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Settings</div>
          </div>
        </NavLink>

        {/* User Menu */}
        <div className="mt-4">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
