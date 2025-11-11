/*
# 创建英语单词消消乐游戏数据库表

## 1. 新建表
- `word_libraries` - 词库表
  - `id` (uuid, 主键, 默认: gen_random_uuid())
  - `name` (text, 词库名称, 非空)
  - `description` (text, 词库描述)
  - `is_default` (boolean, 是否为默认词库, 默认: false)
  - `created_at` (timestamptz, 创建时间, 默认: now())
  - `updated_at` (timestamptz, 更新时间, 默认: now())

- `word_pairs` - 单词对表
  - `id` (uuid, 主键, 默认: gen_random_uuid())
  - `library_id` (uuid, 外键关联词库表)
  - `english_word` (text, 英语单词, 非空)
  - `chinese_translation` (text, 中文翻译, 非空)
  - `created_at` (timestamptz, 创建时间, 默认: now())

- `game_records` - 游戏记录表
  - `id` (uuid, 主键, 默认: gen_random_uuid())
  - `player_name` (text, 玩家名称, 非空)
  - `library_id` (uuid, 外键关联词库表)
  - `word_count` (integer, 单词数量, 非空)
  - `steps` (integer, 完成步数, 非空)
  - `time_seconds` (integer, 完成时间(秒), 非空)
  - `completed_at` (timestamptz, 完成时间, 默认: now())

## 2. 安全策略
- 所有表都设置为公开访问，不启用RLS
- 这是一个公开的游戏应用，所有用户都可以查看和添加记录

## 3. 初始数据
- 插入默认的游戏术语词库
- 包含FPS、crosshair、respawn等游戏相关英语单词及其中文翻译
*/

-- 创建词库表
CREATE TABLE IF NOT EXISTS word_libraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建单词对表
CREATE TABLE IF NOT EXISTS word_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid REFERENCES word_libraries(id) ON DELETE CASCADE,
  english_word text NOT NULL,
  chinese_translation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 创建游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  library_id uuid REFERENCES word_libraries(id) ON DELETE CASCADE,
  word_count integer NOT NULL,
  steps integer NOT NULL,
  time_seconds integer NOT NULL,
  completed_at timestamptz DEFAULT now()
);

-- 插入默认游戏术语词库
INSERT INTO word_libraries (name, description, is_default) VALUES 
('游戏术语词库', '包含FPS、MOBA等游戏相关英语单词及其中文翻译', true);

-- 获取刚插入的词库ID
DO $$
DECLARE
    library_uuid uuid;
BEGIN
    SELECT id INTO library_uuid FROM word_libraries WHERE is_default = true LIMIT 1;
    
    -- 插入游戏术语单词对
    INSERT INTO word_pairs (library_id, english_word, chinese_translation) VALUES 
    (library_uuid, 'FPS', '第一人称射击'),
    (library_uuid, 'crosshair', '准心'),
    (library_uuid, 'respawn', '重生'),
    (library_uuid, 'ping', '延迟'),
    (library_uuid, 'ammo', '弹药'),
    (library_uuid, 'ADS', '瞄准'),
    (library_uuid, 'reload', '装弹'),
    (library_uuid, 'recoil control', '压枪'),
    (library_uuid, 'quick scope', '瞬狙'),
    (library_uuid, 'flick shot', '甩枪'),
    (library_uuid, 'prefire', '提前枪'),
    (library_uuid, 'bunny hop', '连跳'),
    (library_uuid, 'one tap', '一发击中'),
    (library_uuid, 'camping', '蹲点'),
    (library_uuid, 'rush', '快攻'),
    (library_uuid, 'flank', '绕后'),
    (library_uuid, 'peek', '架点'),
    (library_uuid, 'trade', '补枪'),
    (library_uuid, 'defuse', '拆弹'),
    (library_uuid, 'battle royal', '大逃杀'),
    (library_uuid, 'noob', '新手'),
    (library_uuid, 'loot', '舔包'),
    (library_uuid, 'cheat', '作弊'),
    (library_uuid, 'clutch', '残局'),
    (library_uuid, 'cut noise', '静步'),
    (library_uuid, 'feeding', '白给'),
    (library_uuid, 'lagging', '卡顿'),
    (library_uuid, 'jiggle peek', '快速警戒'),
    (library_uuid, 'grenade', '手雷'),
    (library_uuid, 'rifle', '步枪');
END $$;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_word_pairs_library_id ON word_pairs(library_id);
CREATE INDEX IF NOT EXISTS idx_game_records_library_word_count ON game_records(library_id, word_count);
CREATE INDEX IF NOT EXISTS idx_game_records_time ON game_records(time_seconds);