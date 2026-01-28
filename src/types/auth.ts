/**
 * 认证相关类型定义
 */

/**
 * 用户类型
 * 基于 Supabase User 类型的简化版本
 */
export interface User {
  /** UUID from Supabase Auth */
  id: string;
  /** 用户的电子邮件地址 */
  email: string;
  /** 可选元数据 */
  user_metadata?: {
    /** 显示名称 */
    name?: string;
    /** 头像图片 URL */
    avatar_url?: string;
  };
  /** 账户创建时间戳 */
  created_at: string;
}

/**
 * 认证状态接口
 */
export interface AuthState {
  /** 当前用户，未登录时为 null */
  user: User | null;
  /** 是否正在加载认证状态 */
  isLoading: boolean;
  /** 是否已认证 */
  isAuthenticated: boolean;
  
  /** 初始化认证状态 */
  initialize: () => Promise<void>;
  /** 登出 */
  signOut: () => Promise<void>;
}

/**
 * 将 Supabase User 转换为应用 User 类型
 */
export function mapSupabaseUser(supabaseUser: any | null): User | null {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    user_metadata: supabaseUser.user_metadata,
    created_at: supabaseUser.created_at || new Date().toISOString(),
  };
}
