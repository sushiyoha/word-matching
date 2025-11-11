/*
# 更新表结构
- `word_pairs` 表添加字段：
  - `lang_a` (text, 语言A的语音名称，如 'en-US-EricNeural')
  - `lang_b` (text, 语言B的语音名称，如 'zh-CN-XiaoxiaoNeural')

## 说明
- 这些字段用于存储每个单词对的语音信息（包括完整的语音名称）
- 在游戏中点击卡牌时，会根据语言的完整名称使用 TTS 合成。
*/

-- 添加语言字段（如果没有的话）
ALTER TABLE word_pairs
ADD COLUMN IF NOT EXISTS lang_a text DEFAULT 'en-US-EricNeural',
ADD COLUMN IF NOT EXISTS lang_b text DEFAULT 'zh-CN-XiaoxiaoNeural';

-- 为现有数据设置默认语言名称（如果字段为空）
UPDATE word_pairs
SET lang_a = 'en-US-EricNeural'
WHERE lang_a IS NULL;

UPDATE word_pairs
SET lang_b = 'zh-CN-XiaoxiaoNeural'
WHERE lang_b IS NULL;
