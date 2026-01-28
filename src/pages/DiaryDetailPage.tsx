import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Plus, X } from 'lucide-react';
import { useDiaryStore } from '../store/diaryStore';
import { useThemeStore } from '../store/themeStore';
import { useTaskStore } from '../store/taskStore';
import { MoodIcon } from '../components/MoodIcon';
import { TaskCard } from '../components/task/TaskCard';
import MarkdownPreview from '../components/MarkdownPreview';
import { taskService } from '../services/taskService';
import type { Mood } from '../types';
import type { Task, TaskWithCategory } from '../types/task';

export default function DiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const { diaries, deleteDiaryById, setEditingId } = useDiaryStore();
  const { tasks, loadTasks, completeTask, uncompleteTask, deleteTask: deleteTaskFromStore } = useTaskStore();

  // 任务关联状态
  const [linkedTasks, setLinkedTasks] = useState<Task[]>([]);
  const [isLinkingTask, setIsLinkingTask] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<TaskWithCategory[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  const diary = diaries.find((d) => d.id === id);

  // 加载关联的任务
  useEffect(() => {
    if (id) {
      loadLinkedTasks();
      loadTasks();
    }
  }, [id]);

  const loadLinkedTasks = async () => {
    if (!id) return;
    setIsLoadingLinks(true);
    try {
      const response = await taskService.getTasksForDiaryEntry(id);
      if (response.data) {
        setLinkedTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to load linked tasks:', error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  // 获取可关联的任务（未关联的任务）
  const getAvailableTasks = () => {
    const linkedTaskIds = new Set(linkedTasks.map(t => t.id));
    return tasks.filter(t => !linkedTaskIds.has(t.id));
  };

  // 链接任务到日记
  const handleLinkTask = async (taskId: string) => {
    if (!id) return;
    try {
      await taskService.linkTaskToDiary(taskId, id);
      await loadLinkedTasks();
      setIsLinkingTask(false);
    } catch (error) {
      console.error('Failed to link task:', error);
      alert('关联任务失败 Failed to link task');
    }
  };

  // 取消任务关联
  const handleUnlinkTask = async (taskId: string) => {
    if (!id) return;
    if (!window.confirm('确定要取消关联这个任务吗？')) return;
    try {
      await taskService.unlinkTaskFromDiary(taskId, id);
      await loadLinkedTasks();
    } catch (error) {
      console.error('Failed to unlink task:', error);
      alert('取消关联失败 Failed to unlink task');
    }
  };

  // 处理任务完成切换
  const handleToggleComplete = async (taskId: string, isComplete: boolean) => {
    try {
      if (isComplete) {
        await uncompleteTask(taskId);
      } else {
        await completeTask(taskId);
      }
      await loadLinkedTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  // 处理任务删除
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('确定要删除这个任务吗？')) return;
    try {
      await deleteTaskFromStore(taskId);
      await loadLinkedTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (!diary) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">😕</p>
        <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>日记不存在</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          返回首页
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditingId(diary.id);
    navigate('/write');
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这条日记吗？')) return;
    try {
      await deleteDiaryById(diary.id);
      navigate('/');
    } catch {
      alert('删除失败');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodLabel = (moodValue: Mood | null) => {
    const moodMap = {
      happy: '开心',
      calm: '平静',
      neutral: '一般',
      sad: '难过',
      angry: '生气',
    };
    return moodValue ? moodMap[moodValue] : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8"
    >
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className={`mb-4 flex items-center transition-colors ${
          isDark 
            ? 'text-gray-400 hover:text-white' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        ← 返回列表
      </button>

      {/* 日记内容 */}
      <div className={`rounded-lg shadow-lg p-8 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* 标题 */}
        {diary.title && (
          <h1 className={`text-3xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {diary.title}
          </h1>
        )}

        {/* 元信息 */}
        <div className={`flex flex-wrap items-center gap-4 mb-6 pb-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`flex items-center ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            {formatDate(diary.createdAt)}
          </div>

          {diary.mood && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <MoodIcon mood={diary.mood} className="w-6 h-6" />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {getMoodLabel(diary.mood)}
              </span>
            </div>
          )}

          {diary.weather && (
            <div className={`flex items-center gap-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>🌡️</span>
              <span className="text-sm">
                {diary.weather.temp}°C {diary.weather.description}
              </span>
            </div>
          )}

          {diary.location && (
            <div className={`flex items-center gap-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>📍</span>
              <span className="text-sm">{diary.location}</span>
            </div>
          )}
        </div>

        {/* 标签 */}
        {diary.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {diary.tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 text-sm rounded-full ${
                  isDark 
                    ? 'bg-blue-900 text-blue-200' 
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 图片 */}
        {diary.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {diary.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`图片 ${idx + 1}`}
                className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* 正文 */}
        <div className={`prose prose-lg max-w-none ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          <MarkdownPreview content={diary.content} isDark={isDark} />
        </div>

        {/* 关联的任务 */}
        <div className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Link2 className="w-5 h-5" />
              关联任务 Linked Tasks ({linkedTasks.length})
            </h3>
            <button
              onClick={() => {
                setAvailableTasks(getAvailableTasks());
                setIsLinkingTask(true);
              }}
              className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              关联任务
            </button>
          </div>

          {isLoadingLinks ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : linkedTasks.length > 0 ? (
            <div className="space-y-2">
              {linkedTasks.map((task) => {
                const taskWithCategory = tasks.find(t => t.id === task.id);
                if (!taskWithCategory) return null;
                return (
                  <div key={task.id} className="relative">
                    <TaskCard
                      task={taskWithCategory}
                      onEdit={() => navigate('/tasks')}
                      onDelete={handleDeleteTask}
                      onToggleComplete={handleToggleComplete}
                      showActions={true}
                    />
                    <button
                      onClick={() => handleUnlinkTask(task.id)}
                      className={`
                        absolute top-2 right-2 p-1.5 rounded-md transition-colors
                        ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'}
                      `}
                      title="取消关联 Unlink"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`
              text-center py-8 rounded-lg border
              ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
            `}>
              <Link2 className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                还没有关联任务 No linked tasks yet
              </p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className={`flex justify-end space-x-3 mt-8 pt-6 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={handleEdit}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ✏️ 编辑
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🗑️ 删除
          </button>
        </div>
      </div>

      {/* 更新时间 */}
      {diary.updatedAt !== diary.createdAt && (
        <div className={`mt-4 text-center text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          最后更新：{formatDate(diary.updatedAt)}
        </div>
      )}

      {/* 任务选择模态框 */}
      {isLinkingTask && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLinkingTask(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-full max-w-2xl max-h-[70vh] overflow-hidden
              rounded-xl shadow-2xl z-50
              ${isDark ? 'bg-gray-800' : 'bg-white'}
            `}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                选择要关联的任务 Select Task to Link
              </h3>
              <button
                onClick={() => setIsLinkingTask(false)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
                `}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(70vh-80px)]">
              {availableTasks.length > 0 ? (
                <div className="space-y-2">
                  {availableTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleLinkTask(task.id)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${isDark 
                          ? 'bg-gray-900 border-gray-700 hover:border-purple-500 hover:bg-gray-800' 
                          : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description.substring(0, 100)}
                              {task.description.length > 100 && '...'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {task.priority === 'high' && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-500">
                              高 High
                            </span>
                          )}
                          {task.priority === 'medium' && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-500">
                              中 Medium
                            </span>
                          )}
                          {task.priority === 'low' && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-500">
                              低 Low
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`
                  text-center py-12 rounded-lg border
                  ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    没有可关联的任务 No available tasks
                  </p>
                  <button
                    onClick={() => {
                      setIsLinkingTask(false);
                      navigate('/tasks');
                    }}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    创建新任务 Create New Task
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
