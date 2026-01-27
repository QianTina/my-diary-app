-- 迁移脚本：从 v1.0 升级到 v2.0
-- 为现有的 diaries 表添加新字段

-- 1. 添加标题字段
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';

-- 2. 添加心情字段
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'calm', 'angry'));

-- 3. 添加天气字段（JSON 格式）
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS weather JSONB;

-- 4. 添加地理位置字段
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';

-- 5. 添加图片数组字段
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 6. 添加加密标记字段
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;

-- 7. 添加更新时间字段
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 8. 为现有数据设置默认值（如果有旧数据）
UPDATE diaries 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 9. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_diaries_mood ON diaries(mood);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_tags ON diaries USING GIN(tags);

-- 10. 添加注释
COMMENT ON COLUMN diaries.title IS '日记标题';
COMMENT ON COLUMN diaries.mood IS '心情标签：happy, sad, neutral, calm, angry';
COMMENT ON COLUMN diaries.weather IS '天气信息 JSON：{temp: number, description: string}';
COMMENT ON COLUMN diaries.location IS '地理位置：城市 · 区域';
COMMENT ON COLUMN diaries.images IS '图片 URL 数组';
COMMENT ON COLUMN diaries.is_encrypted IS '是否加密存储';
COMMENT ON COLUMN diaries.updated_at IS '最后更新时间';

-- 完成！
SELECT 'Migration completed successfully!' AS status;
