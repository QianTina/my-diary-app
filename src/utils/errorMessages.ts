/**
 * 错误消息映射工具
 * 将 Supabase 错误代码转换为用户友好的双语消息
 */

interface ErrorMessage {
  zh: string;
  en: string;
}

const errorMessages: Record<string, ErrorMessage> = {
  // 认证错误
  'invalid_credentials': {
    zh: '邮箱或密码错误',
    en: 'Invalid email or password',
  },
  'email_not_confirmed': {
    zh: '请先验证您的邮箱',
    en: 'Please verify your email first',
  },
  'user_already_exists': {
    zh: '该邮箱已被注册',
    en: 'Email already registered',
  },
  'weak_password': {
    zh: '密码强度不足，至少需要 6 个字符',
    en: 'Password too weak, minimum 6 characters required',
  },
  'invalid_email': {
    zh: '邮箱格式不正确',
    en: 'Invalid email format',
  },
  
  // 会话错误
  'session_expired': {
    zh: '会话已过期，请重新登录',
    en: 'Session expired, please login again',
  },
  'not_authenticated': {
    zh: '未登录，请先登录',
    en: 'Not authenticated, please login',
  },
  
  // 网络错误
  'network_error': {
    zh: '网络连接失败，请检查网络',
    en: 'Network error, please check connection',
  },
  'timeout': {
    zh: '请求超时，请重试',
    en: 'Request timeout, please retry',
  },
  
  // 数据库错误
  'permission_denied': {
    zh: '权限不足',
    en: 'Permission denied',
  },
  'not_found': {
    zh: '数据不存在',
    en: 'Data not found',
  },
  
  // 默认错误
  'unknown_error': {
    zh: '发生未知错误，请重试',
    en: 'Unknown error occurred, please retry',
  },
};

/**
 * 获取用户友好的错误消息
 * @param error - Supabase 错误对象或错误代码
 * @returns 双语错误消息字符串
 */
export function getErrorMessage(error: any): string {
  let errorCode = 'unknown_error';
  
  if (typeof error === 'string') {
    errorCode = error;
  } else if (error?.code) {
    errorCode = error.code;
  } else if (error?.message) {
    // 尝试从错误消息中提取错误类型
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid') && (message.includes('email') || message.includes('password'))) {
      errorCode = 'invalid_credentials';
    } else if (message.includes('email') && message.includes('confirm')) {
      errorCode = 'email_not_confirmed';
    } else if (message.includes('already') && message.includes('exist')) {
      errorCode = 'user_already_exists';
    } else if (message.includes('password') && message.includes('weak')) {
      errorCode = 'weak_password';
    } else if (message.includes('network') || message.includes('fetch')) {
      errorCode = 'network_error';
    } else if (message.includes('timeout')) {
      errorCode = 'timeout';
    } else if (message.includes('permission')) {
      errorCode = 'permission_denied';
    } else if (message.includes('not found')) {
      errorCode = 'not_found';
    }
  }
  
  const errorMsg = errorMessages[errorCode] || errorMessages['unknown_error'];
  return `${errorMsg.zh} ${errorMsg.en}`;
}

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 * @param password - 密码
 * @returns 是否有效
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * 获取验证错误消息
 * @param field - 字段名称
 * @param value - 字段值
 * @returns 错误消息或 null
 */
export function getValidationError(field: 'email' | 'password', value: string): string | null {
  if (field === 'email' && !isValidEmail(value)) {
    return getErrorMessage('invalid_email');
  }
  
  if (field === 'password' && !isValidPassword(value)) {
    return getErrorMessage('weak_password');
  }
  
  return null;
}
