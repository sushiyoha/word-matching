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
  lang_a text DEFAULT 'en-US-EricNeural',
  lang_b text DEFAULT 'zh-CN-XiaoxiaoNeural',
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
  level_id uuid REFERENCES word_library_levels(id) ON DELETE SET NULL,
  completed_at timestamptz DEFAULT now()
);

-- 创建词库关卡表
CREATE TABLE IF NOT EXISTS word_library_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid REFERENCES word_libraries(id) ON DELETE CASCADE,
  level_name text NOT NULL,
  level_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 创建TTS音频表
CREATE TABLE IF NOT EXISTS tts_audio (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  word text NOT NULL,
  lang text NOT NULL,
  audio_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 为 word_pairs 表添加 level_id 字段
ALTER TABLE word_pairs ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES word_library_levels(id) ON DELETE CASCADE;

-- 为 game_records 表添加 level_id 字段
ALTER TABLE game_records ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES word_library_levels(id) ON DELETE SET NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_word_pairs_library_id ON word_pairs(library_id);
CREATE INDEX IF NOT EXISTS idx_game_records_library_word_count ON game_records(library_id, word_count);
CREATE INDEX IF NOT EXISTS idx_game_records_time ON game_records(time_seconds);
CREATE INDEX IF NOT EXISTS idx_word_library_levels_library_id ON word_library_levels(library_id);
CREATE INDEX IF NOT EXISTS idx_word_library_levels_order ON word_library_levels(library_id, level_order);
CREATE INDEX IF NOT EXISTS idx_word_pairs_level_id ON word_pairs(level_id);
CREATE INDEX IF NOT EXISTS idx_game_records_level_id ON game_records(level_id);

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

-- 为现有数据设置默认语言名称（如果字段为空）
UPDATE word_pairs
SET lang_a = 'en-US-EricNeural'
WHERE lang_a IS NULL;

UPDATE word_pairs
SET lang_b = 'zh-CN-XiaoxiaoNeural'
WHERE lang_b IS NULL;
