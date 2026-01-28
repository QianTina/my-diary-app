import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { X, PenLine, CheckSquare, Plus } from 'lucide-react';
import type { EntryModalProps } from '../../types/calendar';
import { MoodIcon } from '../MoodIcon';
import { TaskCard } from '../task/TaskCard';
import { TaskForm } from '../task/TaskForm';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';
import type { TaskWithCategory } from '../../types/task';

export default function EntryModal({ date, entries, onClose }: EntryModalProps) {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const { tasks, completeTask, uncompleteTask, deleteTask } = useTaskStore();

  // 任务表单状态
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithCategory | null>(null);

  // 获取当天的任务
  const dateStr = format(date, 'yyyy-MM-dd');
  const dateTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = task.due_date.split('T')[0];
    return taskDate === dateStr;
  });

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // 阻止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleEntryClick = (entryId: string) => {
    navigate(`/diary/${entryId}`);
  };

  const handleWriteNew = () => {
    navigate('/write');
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: TaskWithCategory) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleToggleComplete = async (taskId: string, isComplete: boolean) => {
    if (isComplete) {
      await uncompleteTask(taskId);
    } else {
      await completeTask(taskId);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`entry-modal ${isDark ? 'dark' : ''}`}>
        {/* Modal 头部 */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {format(date, 'yyyy年M月d日')}
          </h2>
          <button 
            className="close-button" 
            onClick={onClose} 
            aria-label="关闭"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal 内容 */}
        <div className="modal-content">
          {/* 日记列表 */}
          {entries.length > 0 ? (
            <div className="entry-list mb-6">
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                日记 Diary Entries ({entries.length})
              </h3>
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="entry-card"
                  onClick={() => handleEntryClick(entry.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEntryClick(entry.id);
                    }
                  }}
                  aria-label={`查看日记: ${entry.title}`}
                >
                  <div className="entry-header">
                    <h3 className="entry-title">{entry.title}</h3>
                    {entry.mood && (
                      <span 
                        className="entry-mood" 
                        title={entry.mood}
                        aria-label={`心情: ${entry.mood}`}
                      >
                        <MoodIcon mood={entry.mood} className="w-6 h-6" />
                      </span>
                    )}
                  </div>
                  
                  <p className="entry-preview">
                    {entry.content.substring(0, 100)}
                    {entry.content.length > 100 && '...'}
                  </p>
                  
                  <div className="entry-meta">
                    <span className="entry-time">
                      {format(new Date(entry.createdAt), 'HH:mm')}
                    </span>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="entry-tags">
                        {entry.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="tag-more">+{entry.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state mb-6">
              <div className="empty-icon">
                <PenLine className="w-12 h-12" />
              </div>
              <p className="empty-text">这一天还没有日记</p>
              <button 
                className="write-button" 
                onClick={handleWriteNew}
                aria-label="写一篇日记"
              >
                <PenLine className="w-4 h-4" />
                <span>写一篇日记</span>
              </button>
            </div>
          )}

          {/* 任务列表 */}
          <div className="task-section">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                任务 Tasks ({dateTasks.length})
              </h3>
              <button
                onClick={handleCreateTask}
                className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建任务
              </button>
            </div>

            {dateTasks.length > 0 ? (
              <div className="space-y-2">
                {dateTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className={`
                text-center py-8 rounded-lg border
                ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
              `}>
                <CheckSquare className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  这一天还没有任务
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 任务表单 */}
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => {
            setIsTaskFormOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          mode={editingTask ? 'edit' : 'create'}
          defaultDueDate={dateStr}
        />
      </div>
    </div>
  );
}
