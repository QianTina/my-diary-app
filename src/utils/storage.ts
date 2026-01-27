import { supabase } from './supabase';
import type { Diary } from '../types';

/**
 * 映射数据库字段到前端类型
 */
const mapToDiary = (item: any): Diary => ({
  id: item.id,
  content: item.content,
  createdAt: item.created_at,
});

/**
 * 获取所有日记 (Supabase)
 * @returns {Promise<Diary[]>} 日记列表
 */
export const getDiaries = async (): Promise<Diary[]> => {
  const { data, error } = await supabase
    .from('diaries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diaries:', error);
    throw error;
  }

  return (data || []).map(mapToDiary);
};

/**
 * 添加新日记 (Supabase)
 * @param {string} content - 日记内容
 * @returns {Promise<Diary>} 新创建的日记对象
 */
export const addDiary = async (content: string): Promise<Diary> => {
  const { data, error } = await supabase
    .from('diaries')
    .insert([{ content }])
    .select()
    .single();

  if (error) {
    console.error('Error adding diary:', error);
    throw error;
  }

  return mapToDiary(data);
};

/**
 * 更新日记 (Supabase)
 * @param {string} id - 日记 ID
 * @param {string} content - 新的日记内容
 * @returns {Promise<Diary>} 更新后的日记对象
 */
export const updateDiary = async (id: string, content: string): Promise<Diary> => {
  const { data, error } = await supabase
    .from('diaries')
    .update({ content })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating diary:', error);
    throw error;
  }

  return mapToDiary(data);
};

/**
 * 删除日记 (Supabase)
 * @param {string} id - 要删除的日记 ID
 */
export const deleteDiary = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('diaries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting diary:', error);
    throw error;
  }
};
