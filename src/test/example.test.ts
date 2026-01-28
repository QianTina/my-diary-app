/**
 * 示例测试文件
 * 验证测试框架配置是否正确
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

describe('测试框架配置验证', () => {
  it('基本断言应该工作', () => {
    expect(1 + 1).toBe(2);
  });

  it('fast-check 属性测试应该工作', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a; // 加法交换律
      }),
      { numRuns: 100 }
    );
  });
});
