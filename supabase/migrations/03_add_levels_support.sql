/*
# 添加关卡支持

## 1. 新建表
- `word_library_levels` - 词库关卡表
  - `id` (uuid, 主键, 默认: gen_random_uuid())
  - `library_id` (uuid, 外键关联词库表)
  - `level_name` (text, 关卡名称, 非空)
  - `level_order` (integer, 关卡顺序, 非空)
  - `created_at` (timestamptz, 创建时间, 默认: now())

## 2. 修改表
- `word_pairs` - 添加 `level_id` 字段关联关卡表
- `game_records` - 添加 `level_id` 字段记录游戏所属关卡

## 3. 安全策略
- 所有表都设置为公开访问，不启用RLS

## 4. 数据迁移
- 为现有词库创建默认关卡
- 将现有单词对关联到默认关卡
*/

-- 创建词库关卡表
CREATE TABLE IF NOT EXISTS word_library_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid REFERENCES word_libraries(id) ON DELETE CASCADE,
  level_name text NOT NULL,
  level_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 为word_pairs表添加level_id字段
ALTER TABLE word_pairs ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES word_library_levels(id) ON DELETE CASCADE;

-- 为game_records表添加level_id字段
ALTER TABLE game_records ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES word_library_levels(id) ON DELETE SET NULL;

-- 为现有词库创建默认关卡
DO $$
DECLARE
    lib_record RECORD;
    default_level_uuid uuid;
BEGIN
    -- 遍历所有现有词库
    FOR lib_record IN SELECT id, name FROM word_libraries LOOP
        -- 为每个词库创建一个默认关卡
        INSERT INTO word_library_levels (library_id, level_name, level_order)
        VALUES (lib_record.id, '默认关卡', 1)
        RETURNING id INTO default_level_uuid;
        
        -- 将该词库的所有单词对关联到默认关卡
        UPDATE word_pairs 
        SET level_id = default_level_uuid 
        WHERE library_id = lib_record.id AND level_id IS NULL;
    END LOOP;
END $$;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_word_library_levels_library_id ON word_library_levels(library_id);
CREATE INDEX IF NOT EXISTS idx_word_library_levels_order ON word_library_levels(library_id, level_order);
CREATE INDEX IF NOT EXISTS idx_word_pairs_level_id ON word_pairs(level_id);
CREATE INDEX IF NOT EXISTS idx_game_records_level_id ON game_records(level_id);