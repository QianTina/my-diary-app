/**
 * 主题工具函数
 */

export const themeClasses = {
  // 背景色
  bg: {
    primary: (isDark: boolean) => isDark ? 'bg-gray-950' : 'bg-gray-50',
    secondary: (isDark: boolean) => isDark ? 'bg-gray-900' : 'bg-white',
    card: (isDark: boolean) => isDark ? 'bg-gray-800' : 'bg-white',
    hover: (isDark: boolean) => isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
  },
  
  // 文字颜色
  text: {
    primary: (isDark: boolean) => isDark ? 'text-white' : 'text-gray-900',
    secondary: (isDark: boolean) => isDark ? 'text-gray-300' : 'text-gray-700',
    muted: (isDark: boolean) => isDark ? 'text-gray-400' : 'text-gray-500',
    disabled: (isDark: boolean) => isDark ? 'text-gray-600' : 'text-gray-400',
  },
  
  // 边框
  border: {
    default: (isDark: boolean) => isDark ? 'border-gray-700' : 'border-gray-200',
    hover: (isDark: boolean) => isDark ? 'hover:border-gray-600' : 'hover:border-gray-300',
  },
  
  // 输入框
  input: {
    base: (isDark: boolean) => isDark 
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    focus: (isDark: boolean) => isDark 
      ? 'focus:border-purple-500' 
      : 'focus:border-purple-500',
  },
  
  // 按钮
  button: {
    secondary: (isDark: boolean) => isDark
      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  },
};

/**
 * 组合主题类名
 */
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
