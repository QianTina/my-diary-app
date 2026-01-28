import { motion } from 'framer-motion';
import { useDiaryStore } from '../store/diaryStore';
import { exportToJSON, exportToMarkdown, importFromJSON } from '../utils/export';
import { useThemeStore } from '../store/themeStore';
import { Download, Upload, FileJson, FileText, Trash2, Info, Database } from 'lucide-react';

export default function SettingsPage() {
  const { diaries, createDiary } = useDiaryStore();
  const isDark = useThemeStore((state) => state.isDark);

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

  const today = new Date().toLocaleDateString('zh-CN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen">
      {/* 顶部栏 */}
      <header className={`border-b px-8 py-4 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{today}</div>
      </header>

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* 数据管理 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Database className="w-6 h-6 text-purple-500" />
            <span>数据管理</span>
          </h2>
          
          <div className={`p-4 rounded-lg mb-6 ${
            isDark ? 'bg-gray-900' : 'bg-gray-100'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              当前共有 <span className="font-bold text-purple-400 text-lg">{diaries.length}</span> 条日记
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => exportToJSON(diaries)}
              className={`w-full px-4 py-4 rounded-lg transition-colors flex items-center justify-between group ${
                isDark 
                  ? 'bg-gray-900 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileJson className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>导出为 JSON</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>完整数据备份，可用于导入恢复</p>
                </div>
              </div>
              <Download className={`w-5 h-5 transition-colors ${
                isDark 
                  ? 'text-gray-400 group-hover:text-white' 
                  : 'text-gray-600 group-hover:text-gray-900'
              }`} />
            </button>

            <button
              onClick={() => exportToMarkdown(diaries)}
              className={`w-full px-4 py-4 rounded-lg transition-colors flex items-center justify-between group ${
                isDark 
                  ? 'bg-gray-900 hover:bg-gray-700' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>导出为 Markdown</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>可读性强，便于分享和打印</p>
                </div>
              </div>
              <Download className={`w-5 h-5 transition-colors ${
                isDark 
                  ? 'text-gray-400 group-hover:text-white' 
                  : 'text-gray-600 group-hover:text-gray-900'
              }`} />
            </button>

            <label className={`block w-full px-4 py-4 rounded-lg transition-colors cursor-pointer group ${
              isDark 
                ? 'bg-gray-900 hover:bg-gray-700' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>从 JSON 导入</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>恢复之前导出的数据</p>
                  </div>
                </div>
                <Upload className={`w-5 h-5 transition-colors ${
                  isDark 
                    ? 'text-gray-400 group-hover:text-white' 
                    : 'text-gray-600 group-hover:text-gray-900'
                }`} />
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </motion.div>

        {/* 关于 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl p-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center space-x-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Info className="w-5 h-5" />
            <span>关于</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div className={`flex justify-between ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>版本</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>v2.0.0</span>
            </div>
            <div className={`flex justify-between ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>技术栈</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>React + TypeScript + Vite</span>
            </div>
            <div className={`flex justify-between ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>数据存储</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>LocalStorage / Supabase</span>
            </div>
          </div>
        </motion.div>

        {/* 危险区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-900/20 rounded-xl p-6 border-2 border-red-800"
        >
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center space-x-2">
            <Trash2 className="w-5 h-5" />
            <span>危险区域</span>
          </h2>
          <button
            onClick={clearAllData}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            清空所有数据
          </button>
          <p className="mt-3 text-xs text-red-400">
            此操作将删除所有日记和设置，且不可恢复！请先导出备份。
          </p>
        </motion.div>
      </div>
    </div>
  );
}
