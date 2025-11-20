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



-- 创建词库关卡表
CREATE TABLE IF NOT EXISTS word_library_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid REFERENCES word_libraries(id) ON DELETE CASCADE,
  level_name text NOT NULL,
  level_order integer NOT NULL,
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

-- 允许匿名用户上传文件
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'tts');

-- 允许匿名用户读取文件
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tts');


-- 创建用户档案表（Robin的朋友名册）
CREATE TABLE IF NOT EXISTS user_profiles (
  player_name text PRIMARY KEY,  -- 这是朋友的名字
  total_steps integer DEFAULT 0, -- 累计走了多少步（Robin都记得！）
  total_time_seconds integer DEFAULT 0, -- 累计陪了Robin多久
  last_seen_at timestamptz DEFAULT now(), -- 上次见面是什么时候（用来判断是不是很久没见）
  created_at timestamptz DEFAULT now() -- 第一次认识的时间
);

create or replace function update_user_stats(p_name text, steps_to_add int, time_to_add int)
returns void as $$
  update user_profiles
  set
    total_steps = total_steps + steps_to_add,
    total_time_seconds = total_time_seconds + time_to_add,
    last_seen_at = now()
  where player_name = p_name;
$$ language sql;

ALTER TABLE word_pairs
ALTER COLUMN lang_b SET DEFAULT 'zh-CN-XiaoqiuNeural';

UPDATE word_pairs
SET lang_b = 'zh-CN-XiaoqiuNeural'
WHERE lang_b = 'zh-CN-XiaoxiaoNeural';

ALTER TABLE word_libraries
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN uploader_id UUID REFERENCES auth.users(id),
ADD COLUMN forked_from_id UUID REFERENCES word_libraries(id);

CREATE TABLE IF NOT EXISTS user_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  library_id UUID NOT NULL REFERENCES word_libraries(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  -- 确保同一个人不能重复添加同一个词库
  UNIQUE (user_id, library_id)
);

-- 1. 先给 user_profiles 表添加一个 user_id 列
ALTER TABLE public.user_profiles
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. （可选，但推荐）为 user_id 添加唯一约束，确保一个用户只有一个档案
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);

-- 开启 user_profiles 表的 RLS (行级安全)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建规则前，先清理一下可能存在的旧规则（安全起见）
DROP POLICY IF EXISTS "Users can view their own profile." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.user_profiles;

-- 规则1: 用户可以查看自己的个人档案
CREATE POLICY "Users can view their own profile."
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- 规则2: 用户可以为自己创建一个新的个人档案
CREATE POLICY "Users can insert their own profile."
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 规则3: 用户只可以修改自己的个人档案 (这就是解决您当前问题的关键！)
CREATE POLICY "Users can update their own profile."
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);


-- 先删除旧的函数
DROP FUNCTION IF EXISTS update_user_stats(text, int, int);

-- 创建基于 user_id 的新函数
CREATE OR REPLACE FUNCTION public.update_user_stats_by_id(p_user_id uuid, steps_to_add integer, time_to_add integer)
 RETURNS void
 LANGUAGE sql
AS $function$
  update user_profiles
  set
    total_steps = total_steps + steps_to_add,
    total_time_seconds = total_time_seconds + time_to_add,
    last_seen_at = now()
  where user_id = p_user_id;
$function$;


-- 先删除可能存在的、只认 user_id 的新函数
DROP FUNCTION IF EXISTS public.update_user_stats_by_id(uuid, integer, integer);

-- 创建回我们之前那个只认 playerName 的函数
CREATE OR REPLACE FUNCTION public.update_user_stats_by_name(p_name text, steps_to_add integer, time_to_add integer)
 RETURNS void
 LANGUAGE sql
AS $function$
  update user_profiles
  set
    total_steps = total_steps + steps_to_add,
    total_time_seconds = total_time_seconds + time_to_add,
    last_seen_at = now()
  where player_name = p_name;
$function$;


-- 首先，为 word_libraries 表开启行级安全 (如果尚未开启)
ALTER TABLE public.word_libraries ENABLE ROW LEVEL SECURITY;

-- 为安全起见，先删除可能存在的旧策略
DROP POLICY IF EXISTS "Public libraries are viewable by everyone." ON public.word_libraries;
DROP POLICY IF EXISTS "Users can insert their own libraries." ON public.word_libraries;
DROP POLICY IF EXISTS "Users can update their own libraries." ON public.word_libraries;
DROP POLICY IF EXISTS "Users can delete their own libraries." ON public.word_libraries;


-- ✨ 规则 1: 所有人 (包括游客) 都可以看到被标记为“公共”的书！ ✨
-- 这是解决您当前问题的核心！
CREATE POLICY "Public libraries are viewable by everyone."
ON public.word_libraries FOR SELECT
USING ( is_public = true );


-- ✨ 规则 2: 只有登录的会员才能“捐赠”新书！ ✨
CREATE POLICY "Users can insert their own libraries."
ON public.word_libraries FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );


-- ✨ 规则 3: 只有书的“捐赠者”本人才能修改这本书！ ✨
CREATE POLICY "Users can update their own libraries."
ON public.word_libraries FOR UPDATE
USING ( auth.uid() = uploader_id );


-- ✨ 规则 4: 只有书的“捐赠者”本人才能“下架”这本书！ ✨
CREATE POLICY "Users can delete their own libraries."
ON public.word_libraries FOR DELETE
USING ( auth.uid() = uploader_id );