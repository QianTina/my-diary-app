import { useState, useEffect } from 'react';
import type { Diary } from './types';
import { getDiaries, addDiary, deleteDiary, updateDiary } from './utils/storage';

function App() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // 编辑状态 ID

  // 加载日记数据
  useEffect(() => {
    const fetchDiaries = async () => {
      setIsLoading(true);
      try {
        const data = await getDiaries();
        setDiaries(data);
      } catch (error) {
        console.error("Failed to load diaries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiaries();
  }, []);

  // 处理提交 (新增或更新)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      if (editingId) {
        // 更新模式
        const updatedDiary = await updateDiary(editingId, content);
        setDiaries(diaries.map(d => d.id === editingId ? updatedDiary : d));
        setEditingId(null);
      } else {
        // 新增模式
        const newDiary = await addDiary(content);
        setDiaries([newDiary, ...diaries]);
      }
      setContent('');
    } catch (error) {
      console.error("Failed to save diary:", error);
      alert("保存失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除这条日记吗？")) return;
    
    try {
      await deleteDiary(id);
      setDiaries(diaries.filter(d => d.id !== id));
      // 如果正在编辑被删除的日记，重置编辑状态
      if (editingId === id) {
        setEditingId(null);
        setContent('');
      }
    } catch (error) {
      console.error("Failed to delete diary:", error);
      alert("删除失败");
    }
  };

  // 开始编辑
  const handleEdit = (diary: Diary) => {
    setEditingId(diary.id);
    setContent(diary.content);
    // 滚动到顶部输入框 (可选)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setContent('');
  };

  // 格式化日期
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的日记本</h1>
          <p className="mt-2 text-gray-600">记录生活的点点滴滴</p>
        </div>

        {/* 输入框 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {editingId ? '编辑日记' : '写新日记'}
          </h2>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100 transition-all"
              rows={4}
              placeholder="今天发生了什么..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
            <div className="mt-4 flex justify-end space-x-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  取消
                </button>
              )}
              <button
                type="submit"
                disabled={!content.trim() || isLoading}
                className={`px-6 py-2 text-white rounded-md transition-colors flex items-center ${
                  editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? '更新中...' : '保存中...'}
                  </>
                ) : (
                  editingId ? '确认更新' : '立即记录'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 日记列表 */}
        <div className="space-y-4">
          {isLoading && diaries.length === 0 ? (
             <div className="text-center text-gray-500 py-12 flex flex-col items-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
               <p>正在同步云端数据...</p>
             </div>
          ) : diaries.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
              <p className="text-xl mb-2">👋</p>
              还没有日记，写下第一篇吧！
            </div>
          ) : (
            diaries.map((diary) => (
              <div 
                key={diary.id} 
                className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-all ${
                  editingId === diary.id ? 'ring-2 ring-green-400 bg-green-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm text-gray-500 font-medium flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {formatDate(diary.createdAt)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(diary)}
                      className="text-blue-400 hover:text-blue-600 text-sm transition-colors px-2 py-1 rounded hover:bg-blue-50"
                      disabled={isLoading}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="text-red-400 hover:text-red-600 text-sm transition-colors px-2 py-1 rounded hover:bg-red-50"
                      disabled={isLoading}
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                  {diary.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
