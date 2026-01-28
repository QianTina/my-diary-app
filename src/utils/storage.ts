import { supabase } from './supabase';
import type { Diary, DiaryRow } from '../types';

const mapToDiary = (item: DiaryRow): Diary => ({
  id: item.id,
  user_id: item.user_id,
  title: item.title || '',
  content: item.content,
  mood: item.mood,
  weather: item.weather,
  location: item.location || '',
  tags: item.tags || [],
  images: item.images || [],
  isEncrypted: item.is_encrypted || false,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

const LS_KEY = 'diary_items';

const readLocal = (): Diary[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Diary[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const writeLocal = (arr: Diary[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
};

const genId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getDiaries = async (): Promise<Diary[]> => {
  if (!supabase) {
    const list = readLocal().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return Promise.resolve(list);
  }
  const { data, error } = await supabase
    .from('diaries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching diaries:', error);
    throw error;
  }
  return ((data || []) as DiaryRow[]).map(mapToDiary);
};

export const addDiary = async (diary: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Diary> => {
  if (!supabase) {
    const now = new Date().toISOString();
    const newItem: Diary = {
      id: genId(),
      ...diary,
      createdAt: now,
      updatedAt: now,
    };
    const list = [newItem, ...readLocal()];
    writeLocal(list);
    return Promise.resolve(newItem);
  }
  
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('未认证：请先登录');
  }
  
  const { data, error } = await supabase
    .from('diaries')
    .insert([{
      user_id: user.id,
      title: diary.title,
      content: diary.content,
      mood: diary.mood,
      weather: diary.weather,
      location: diary.location,
      tags: diary.tags,
      images: diary.images,
      is_encrypted: diary.isEncrypted,
    }])
    .select()
    .single();
  if (error) {
    console.error('Error adding diary:', error);
    throw error;
  }
  return mapToDiary(data as DiaryRow);
};

export const updateDiary = async (id: string, updates: Partial<Omit<Diary, 'id' | 'createdAt'>>): Promise<Diary> => {
  if (!supabase) {
    const list = readLocal();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('not found');
    const updated: Diary = { 
      ...list[idx], 
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    writeLocal(list);
    return Promise.resolve(updated);
  }
  const { data, error } = await supabase
    .from('diaries')
    .update({
      title: updates.title,
      content: updates.content,
      mood: updates.mood,
      weather: updates.weather,
      location: updates.location,
      tags: updates.tags,
      images: updates.images,
      is_encrypted: updates.isEncrypted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating diary:', error);
    throw error;
  }
  return mapToDiary(data as DiaryRow);
};

export const deleteDiary = async (id: string): Promise<void> => {
  if (!supabase) {
    const list = readLocal().filter((d) => d.id !== id);
    writeLocal(list);
    return Promise.resolve();
  }
  const { error } = await supabase.from('diaries').delete().eq('id', id);
  if (error) {
    console.error('Error deleting diary:', error);
    throw error;
  }
};
