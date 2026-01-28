// ============================================
// Task Detail Modal Component
// 任务详情模态框组件
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Calendar, Tag, AlertCircle, CheckCircle2, Link2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useThemeStore } from '../../store/themeStore';
import { useDiaryStore } from '../../store/diaryStore';
import { taskService } from '../../services/taskService';
import { MoodIcon } from '../MoodIcon';
import type { TaskWithLinks } from '../../types/task';
import type { Diary } from '../../types';

// ============================================
// Component Props
// ============================================

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: string;
  onClose: () => void;
}

// ============================================
// Component
// ============================================

export function TaskDetailModal({ isOpen, taskId, onClose }: TaskDetailModalProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();
  const { diaries } = useDiaryStore();

  const [task, setTask] = useState<TaskWithLinks | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 加载任务详情
  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskDetails();
    }
  }, [isOpen, taskId]);

  const loadTaskDetails = async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getTask(taskId);
      if (response.data) {
        setTask(response.data);
      }
    } catch (error) {
      console.error('Failed to load task details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取关联的日记
  const getLinkedDiaries = (): Diary[] => {
    if (!task) return [];
    const linkedDiaryIds = new Set(task.diary_links.map(link => link.diary_entry_id));
    return diaries.filter(diary => linkedDiaryIds.has(diary.id));
  };

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const linkedDiaries = getLinkedDiaries();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-2xl max-h-[80vh] overflow-hidden
          rounded-xl shadow-2xl z-50
          ${isDark ? 'bg-gray-800' : 'bg-white'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            任务详情 Task Details
          </h2>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}
            `}
            aria-label="关闭 Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                加载中... Loading...
              </p>
            </div>
          ) : task ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <div className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    状态 Status
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'complete' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          已完成 Complete
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          未完成 Incomplete
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <div className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    优先级 Priority
                  </div>
                  <div className="flex items-center gap-2">
                    {task.priority === 'high' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-500 font-medium">
                        高 High
                      </span>
                    )}
                    {task.priority === 'medium' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-500 font-medium">
                        中 Medium
                      </span>
                    )}
                    {task.priority === 'low' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-500 font-medium">
                        低 Low
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                {task.category && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      分类 Category
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" style={{ color: task.category.color || '#6b7280' }} />
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {task.category.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Due Date */}
                {task.due_date && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      截止日期 Due Date
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {format(new Date(task.due_date), 'yyyy-MM-dd')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Diaries */}
              <div>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Link2 className="w-4 h-4" />
                  关联日记 Linked Diary Entries ({linkedDiaries.length})
                </h4>

                {linkedDiaries.length > 0 ? (
                  <div className="space-y-2">
                    {linkedDiaries.map((diary) => (
                      <div
                        key={diary.id}
                        onClick={() => {
                          onClose();
                          navigate(`/diary/${diary.id}`);
                        }}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          ${isDark 
                            ? 'bg-gray-900 border-gray-700 hover:border-purple-500' 
                            : 'bg-white border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className={`w-5 h-5 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div className="flex-1 min-w-0">
                            <h5 className={`font-medium mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {diary.title || '无标题日记'}
                            </h5>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {format(new Date(diary.createdAt), 'yyyy-MM-dd HH:mm')}
                            </p>
                          </div>
                          {diary.mood && (
                            <MoodIcon mood={diary.mood} className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`
                    text-center py-6 rounded-lg border
                    ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
                  `}>
                    <Link2 className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      还没有关联日记 No linked diary entries
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`text-xs space-y-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <div>创建时间 Created: {format(new Date(task.created_at), 'yyyy-MM-dd HH:mm')}</div>
                  <div>更新时间 Updated: {format(new Date(task.updated_at), 'yyyy-MM-dd HH:mm')}</div>
                  {task.completed_at && (
                    <div>完成时间 Completed: {format(new Date(task.completed_at), 'yyyy-MM-dd HH:mm')}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                任务不存在 Task not found
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
