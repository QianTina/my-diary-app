import { NavLink } from 'react-router-dom';
import { Home, PenLine, Archive, BarChart3, Settings, Sparkles } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function Sidebar() {
  const isDark = useThemeStore((state) => state.isDark);
  
  const navItems = [
    { path: '/', icon: Home, label: '动态', enLabel: 'Dashboard' },
    { path: '/write', icon: PenLine, label: '写作', enLabel: 'Write' },
    { path: '/archive', icon: Archive, label: '归档', enLabel: 'Archive' },
    { path: '/stats', icon: BarChart3, label: '统计', enLabel: 'Stats' },
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

        {/* User Info */}
        <div className="mt-4 flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Tina</div>
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Dev</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
