-- 完整创建 v2.0 日记表
-- 如果表已存在会先删除（注意：会删除所有数据！）

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS diaries CASCADE;

-- 2. 创建新表（包含所有 v2.0 字段）
CREATE TABLE diaries (
  -- 基础字段
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- v2.0 新增：标题
  title TEXT DEFAULT '',
  
  -- 核心内容
  content TEXT NOT NULL,
  
  -- v2.0 新增：心情标签
  mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'calm', 'angry')),
  
  -- v2.0 新增：天气信息
  weather JSONB,
  
  -- v2.0 新增：地理位置
  location TEXT DEFAULT '',
  
  -- 标签数组
  tags TEXT[] DEFAULT '{}',
  
  -- v2.0 新增：图片数组
  images TEXT[] DEFAULT '{}',
  
  -- v2.0 新增：加密标记
  is_encrypted BOOLEAN DEFAULT FALSE,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 创建索引（提升查询性能）
CREATE INDEX idx_diaries_mood ON diaries(mood);
CREATE INDEX idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX idx_diaries_tags ON diaries USING GIN(tags);

-- 4. 启用行级安全策略 (RLS)
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 5. 创建策略：允许匿名用户读写（开发环境）
-- 生产环境建议改为只允许认证用户访问自己的数据
CREATE POLICY "允许匿名读写"
ON diaries
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- 6. 添加表注释
COMMENT ON TABLE diaries IS '日记表 v2.0';
COMMENT ON COLUMN diaries.id IS '唯一标识符';
COMMENT ON COLUMN diaries.title IS '日记标题';
COMMENT ON COLUMN diaries.content IS '日记内容（支持 Markdown）';
COMMENT ON COLUMN diaries.mood IS '心情标签：happy(开心), sad(难过), neutral(一般), calm(平静), angry(生气)';
COMMENT ON COLUMN diaries.weather IS '天气信息 JSON：{"temp": 20, "description": "Sunny"}';
COMMENT ON COLUMN diaries.location IS '地理位置：城市 · 区域';
COMMENT ON COLUMN diaries.tags IS '标签数组';
COMMENT ON COLUMN diaries.images IS '图片 URL 数组（Base64 或 URL）';
COMMENT ON COLUMN diaries.is_encrypted IS '是否加密存储';
COMMENT ON COLUMN diaries.created_at IS '创建时间';
COMMENT ON COLUMN diaries.updated_at IS '最后更新时间';

-- 7. 插入测试数据（可选）
INSERT INTO diaries (title, content, mood, tags) VALUES 
('欢迎使用智能日记', '这是你的第一条日记！开始记录生活的点点滴滴吧 ✨', 'happy', ARRAY['欢迎', '开始']);

-- 完成！
SELECT 
  'Table created successfully!' AS status,
  COUNT(*) AS diary_count 
FROM diaries;
