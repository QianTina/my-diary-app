import { motion } from 'framer-motion';
import { useDiaryStore } from '../store/diaryStore';
import { exportToJSON, exportToMarkdown, importFromJSON } from '../utils/export';
import { useDarkMode } from '../hooks/useDarkMode';

export default function SettingsPage() {
  const { diaries, createDiary } = useDiaryStore();
  const [isDark, setIsDark] = useDarkMode();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedDiaries = await importFromJSON(file);
      if (window.confirm(`将导入 ${importedDiaries.length} 条日记，是否继续？`)) {
        for (const diary of importedDiaries) {
          await createDiary(diary);
        }
        alert('导入成功！');
      }
    } catch {
      alert('导入失败，请检查文件格式');
    }
    e.target.value = '';
  };

  const clearAllData = () => {
    if (!window.confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
    if (!window.confirm('再次确认：真的要删除所有日记吗？')) return;
    
    try {
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      alert('清空失败');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* 外观设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🎨 外观设置
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">暗黑模式</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                切换深色主题，适合夜间使用
              </p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isDark ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          💾 数据管理
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              当前共有 <span className="font-bold text-blue-600 dark:text-blue-400">{diaries.length}</span> 条日记
            </p>
          </div>

          <button
            onClick={() => exportToJSON(diaries)}
            className="w-full px-4 py-3 text-left bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="font-medium">导出为 JSON</p>
              <p className="text-sm opacity-75">完整数据备份，可用于导入恢复</p>
            </div>
            <span className="text-2xl">📥</span>
          </button>

          <button
            onClick={() => exportToMarkdown(diaries)}
            className="w-full px-4 py-3 text-left bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="font-medium">导出为 Markdown</p>
              <p className="text-sm opacity-75">可读性强，便于分享和打印</p>
            </div>
            <span className="text-2xl">📄</span>
          </button>

          <label className="block w-full px-4 py-3 text-left bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer flex items-center justify-between">
            <div>
              <p className="font-medium">从 JSON 导入</p>
              <p className="text-sm opacity-75">恢复之前导出的数据</p>
            </div>
            <span className="text-2xl">📤</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          ℹ️ 关于
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>版本</span>
            <span className="font-medium">v2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>技术栈</span>
            <span className="font-medium">React + TypeScript + Vite</span>
          </div>
          <div className="flex justify-between">
            <span>数据存储</span>
            <span className="font-medium">LocalStorage / Supabase</span>
          </div>
        </div>
      </div>

      {/* 危险区域 */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6 border-2 border-red-200 dark:border-red-800">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">
          ⚠️ 危险区域
        </h2>
        <button
          onClick={clearAllData}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          清空所有数据
        </button>
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          此操作将删除所有日记和设置，且不可恢复！请先导出备份。
        </p>
      </div>
    </motion.div>
  );
}
