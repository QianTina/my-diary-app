# 部署指南

## 部署平台选择

### 1. Vercel（推荐）

#### 特点
- ✅ 零配置部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 免费额度充足

#### 部署步骤

##### 方式一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
```

##### 方式二：通过 Git 集成
1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 访问 https://vercel.com
3. 点击"Import Project"
4. 选择你的仓库
5. 点击"Deploy"

#### 环境变量配置
在 Vercel 项目设置中添加：
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

### 2. Netlify

#### 特点
- ✅ 简单易用
- ✅ 自动部署
- ✅ 免费 SSL

#### 部署步骤

##### 方式一：拖拽部署
```bash
# 构建项目
npm run build

# 将 dist 文件夹拖拽到 Netlify
```

##### 方式二：Git 集成
1. 连接 Git 仓库
2. 配置构建命令：`npm run build`
3. 配置发布目录：`dist`
4. 点击"Deploy"

#### 配置文件
创建 `netlify.toml`：
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 3. GitHub Pages

#### 部署步骤

1. 安装 gh-pages：
```bash
npm install -D gh-pages
```

2. 修改 `package.json`：
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. 修改 `vite.config.ts`：
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
});
```

4. 部署：
```bash
npm run deploy
```

---

### 4. 自托管（Docker）

#### Dockerfile
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 构建和运行
```bash
# 构建镜像
docker build -t diary-app .

# 运行容器
docker run -p 80:80 diary-app
```

---

## 环境变量配置

### 开发环境
创建 `.env` 文件：
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### 生产环境
在部署平台的环境变量设置中添加相同的变量。

---

## 性能优化

### 1. 构建优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown'],
        },
      },
    },
  },
});
```

### 2. 启用 Gzip
大多数平台默认启用，如果自托管需要配置 Nginx。

### 3. CDN 加速
使用 Vercel/Netlify 自动获得全球 CDN。

---

## 数据库部署

### Supabase 配置

1. 创建项目：https://supabase.com
2. 执行 SQL：
```sql
-- 复制 sql/schema.sql 的内容
CREATE TABLE diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 设置 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许匿名读写"
ON diaries FOR ALL TO anon
USING (true) WITH CHECK (true);
```

3. 获取 API 密钥：
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJxxx...`

4. 配置环境变量

---

## 域名配置

### Vercel
1. 在项目设置中点击"Domains"
2. 添加自定义域名
3. 配置 DNS 记录（自动提示）

### Netlify
1. 在项目设置中点击"Domain management"
2. 添加自定义域名
3. 配置 DNS 记录

---

## 监控与分析

### 1. Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// main.tsx
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
```

### 2. Google Analytics
添加到 `index.html`：
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 安全建议

### 1. 环境变量
- ❌ 不要将 `.env` 提交到 Git
- ✅ 使用 `.env.example` 作为模板
- ✅ 在部署平台配置环境变量

### 2. Supabase RLS
生产环境建议启用用户认证：
```sql
-- 只允许用户访问自己的数据
CREATE POLICY "用户只能访问自己的日记"
ON diaries FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### 3. HTTPS
所有推荐的部署平台都自动提供 HTTPS。

---

## 故障排查

### 构建失败
```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
```

### 环境变量不生效
- 确保变量名以 `VITE_` 开头
- 重启开发服务器
- 检查部署平台的环境变量配置

### 路由 404
- 确保配置了 SPA 重定向规则
- Vercel: 自动处理
- Netlify: 添加 `_redirects` 或 `netlify.toml`
- Nginx: 配置 `try_files`

---

## 持续集成

### GitHub Actions
创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## 总结

推荐部署方案：
1. **个人使用**: Vercel + LocalStorage（免费、简单）
2. **多设备同步**: Vercel + Supabase（免费、功能完整）
3. **企业部署**: Docker + 自托管数据库（完全控制）

选择适合你的方案，开始部署吧！🚀
