/**
 * Vitest 测试设置文件
 * 配置测试环境和全局设置
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// 每个测试后自动清理
afterEach(() => {
  cleanup();
});
