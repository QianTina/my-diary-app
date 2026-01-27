# 📚 项目文档目录

## 📖 快速开始

- **[completed-summary.md](./completed-summary.md)** - 项目完成总结 ⭐ 推荐首先阅读
- **[quickstart.md](./quickstart.md)** - 快速开始指南

---

## 📁 文档分类

### 🔒 安全文档 (`security/`)

关于环境变量保护、Supabase 密钥安全的完整指南。

- **[security-summary.md](./security/security-summary.md)** - 安全问题总结 ⭐
- **[security-quickfix.md](./security/security-quickfix.md)** - 快速修复指南
- **[security-guide.md](./security/security-guide.md)** - 完整安全指南
- **[urgent-security-action.md](./security/urgent-security-action.md)** - 紧急操作指南

**推荐阅读顺序：**
1. security-summary.md - 了解问题
2. security-quickfix.md - 快速修复
3. security-guide.md - 深入学习

### 🎨 主题文档 (`theme/`)

关于深色/浅色主题切换功能的实现和修复。

- **[theme-final-fix.md](./theme/theme-final-fix.md)** - 最终修复方案 ⭐
- **[theme-fix-complete.md](./theme/theme-fix-complete.md)** - 修复过程记录
- **[theme-toggle-fixed.md](./theme/theme-toggle-fixed.md)** - 主题切换修复
- **[theme-toggle.md](./theme-toggle.md)** - 主题切换实现

**核心内容：**
- 从 useDarkMode hook 迁移到 Zustand 全局状态
- 解决主题状态不同步问题
- 移除设置页面的主题切换

### 📝 设计文档

项目的设计思路和技术选型。

- **[design.md](./design.md)** - 初始设计文档（v1.0）
- **[design_v2.md](./design_v2.md)** - v2.0 设计文档
- **[ui-redesign.md](./ui-redesign.md)** - UI 重设计说明

### 📋 功能文档

- **[features.md](./features.md)** - 功能列表
- **[usage-guide.md](./usage-guide.md)** - 使用指南
- **[v2-features.md](./v2-features.md)** - v2.0 新功能

### 🏗️ 架构文档

- **[multi-page-structure.md](./multi-page-structure.md)** - 多页面架构说明
- **[supabase-migration.md](./supabase-migration.md)** - Supabase 迁移指南

### 🚀 部署文档

- **[deployment.md](./deployment.md)** - 部署指南
- **[changelog.md](./changelog.md)** - 更新日志
- **[summary.md](./summary.md)** - 项目总结

### 📜 历史记录 (`project-history/`)

开发过程中的完成记录和问题修复。

- **[project-complete.md](./project-history/project-complete.md)** - 初始项目完成
- **[v2-complete.md](./project-history/v2-complete.md)** - v2.0 完成记录
- **[multi-page-complete.md](./project-history/multi-page-complete.md)** - 多页面架构完成
- **[quick-fix.md](./project-history/quick-fix.md)** - 快速修复记录

---

## 🎯 推荐阅读路径

### 新手入门

1. **[completed-summary.md](./completed-summary.md)** - 了解项目全貌
2. **[quickstart.md](./quickstart.md)** - 快速开始
3. **[usage-guide.md](./usage-guide.md)** - 学习使用

### 开发者

1. **[design_v2.md](./design_v2.md)** - 了解设计思路
2. **[multi-page-structure.md](./multi-page-structure.md)** - 理解架构
3. **[theme-final-fix.md](./theme/theme-final-fix.md)** - 学习主题实现

### 安全关注

1. **[security-summary.md](./security/security-summary.md)** - 安全问题总结
2. **[security-quickfix.md](./security/security-quickfix.md)** - 快速修复
3. **[security-guide.md](./security/security-guide.md)** - 完整指南

### 部署上线

1. **[deployment.md](./deployment.md)** - 部署指南
2. **[security-summary.md](./security/security-summary.md)** - 安全配置
3. **[supabase-migration.md](./supabase-migration.md)** - 数据库配置

---

## 📊 文档结构

```
docs/
├── readme.md                        # 本文件
├── completed-summary.md             # 项目完成总结 ⭐
├── quickstart.md                    # 快速开始
│
├── security/                        # 安全文档
│   ├── security-summary.md          # 安全总结 ⭐
│   ├── security-quickfix.md         # 快速修复
│   ├── security-guide.md            # 完整指南
│   └── urgent-security-action.md
│
├── theme/                           # 主题文档
│   ├── theme-final-fix.md           # 最终方案 ⭐
│   ├── theme-fix-complete.md
│   └── theme-toggle-fixed.md
│
├── project-history/                 # 历史记录
│   ├── project-complete.md
│   ├── v2-complete.md
│   ├── multi-page-complete.md
│   └── quick-fix.md
│
├── design.md                        # 设计文档
├── design_v2.md
├── ui-redesign.md
├── features.md                      # 功能文档
├── usage-guide.md
├── v2-features.md
├── multi-page-structure.md          # 架构文档
├── supabase-migration.md
├── deployment.md                    # 部署文档
├── changelog.md
└── summary.md
```

---

## 🔍 快速查找

### 我想了解...

- **项目整体情况** → [completed-summary.md](./completed-summary.md)
- **如何开始使用** → [quickstart.md](./quickstart.md)
- **安全配置** → [security/security-summary.md](./security/security-summary.md)
- **主题切换实现** → [theme/theme-final-fix.md](./theme/theme-final-fix.md)
- **如何部署** → [deployment.md](./deployment.md)
- **数据库配置** → [supabase-migration.md](./supabase-migration.md)
- **功能列表** → [features.md](./features.md)
- **更新历史** → [changelog.md](./changelog.md)

### 我遇到了问题...

- **环境变量泄露** → [security/security-quickfix.md](./security/security-quickfix.md)
- **主题切换不工作** → [theme/theme-final-fix.md](./theme/theme-final-fix.md)
- **数据库连接失败** → [supabase-migration.md](./supabase-migration.md)
- **构建错误** → [quickstart.md](./quickstart.md)

---

## 📝 文档维护

### 添加新文档

根据文档类型放入对应文件夹：

- 安全相关 → `security/`
- 主题相关 → `theme/`
- 历史记录 → `project-history/`
- 其他 → `docs/` 根目录

### 更新文档

修改文档后，记得更新：
1. 本 readme.md 的目录
2. [changelog.md](./changelog.md) 的更新记录

---

## 🆘 需要帮助？

如果文档中没有找到答案：

1. 查看 [GitHub Issues](https://github.com/QianTina/my-diary-app/issues)
2. 查看 [Supabase 文档](https://supabase.com/docs)
3. 提交新的 Issue

---

**最后更新：** 2025-01-27
**文档版本：** v2.0.0
