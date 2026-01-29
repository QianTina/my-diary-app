// ============================================
// Retry Utility
// 重试工具
// ============================================

/**
 * Retry configuration
 * 重试配置
 */
export interface RetryConfig {
  maxAttempts?: number; // Maximum number of retry attempts (default: 3)
  initialDelay?: number; // Initial delay in milliseconds (default: 1000)
  maxDelay?: number; // Maximum delay in milliseconds (default: 10000)
  backoffFactor?: number; // Exponential backoff factor (default: 2)
  shouldRetry?: (error: unknown) => boolean; // Function to determine if error should be retried
}

/**
 * Default retry configuration
 * 默认重试配置
 */
const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: unknown) => {
    // Retry on network errors and 5xx server errors
    if (error && typeof error === 'object') {
      const err = error as any;
      // Network errors
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        return true;
      }
      // Server errors (5xx)
      if (err.status >= 500 && err.status < 600) {
        return true;
      }
    }
    return false;
  },
};

/**
 * Retry a function with exponential backoff
 * 使用指数退避重试函数
 * 
 * @param fn - The function to retry
 * @param config - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts,
    initialDelay,
    maxDelay,
    backoffFactor,
    shouldRetry,
  } = { ...DEFAULT_CONFIG, ...config };

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Don't retry if error is not retryable
      if (!shouldRetry(error)) {
        break;
      }

      // Log retry attempt
      console.warn(
        `Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`,
        error
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  // All retries failed, throw the last error
  throw lastError;
}

/**
 * Check if an error is a network error
 * 检查错误是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return (
      err.message?.includes('network') ||
      err.message?.includes('fetch') ||
      err.message?.includes('timeout') ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'ETIMEDOUT'
    );
  }
  return false;
}

/**
 * Check if an error is a server error (5xx)
 * 检查错误是否为服务器错误（5xx）
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    return err.status >= 500 && err.status < 600;
  }
  return false;
}

/**
 * Check if an error is retryable
 * 检查错误是否可重试
 */
export function isRetryableError(error: unknown): boolean {
  return isNetworkError(error) || isServerError(error);
}
