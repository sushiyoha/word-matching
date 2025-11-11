/*
# 创建 TTS 音频表，用于存储每个单词或句子的语音文件信息

## 1. 字段说明：
- `id`: 唯一标识符，使用 `uuid_generate_v4()` 生成
- `word`: 存储词汇或句子
- `lang`: 存储完整的语音名称（如 `en-US-EricNeural`）
- `audio_url`: 存储语音文件在存储桶中的 URL
- `created_at`: 存储记录的创建时间，使用当前时间戳

## 2. 完整语音名称：
- `lang` 字段应存储完整的语音名称，如 `en-US-EricNeural` 或 `zh-CN-XiaoxiaoNeural`，而不是简化的语言代码。
*/

create table if not exists tts_audio (
  id uuid primary key default uuid_generate_v4(),    -- 使用 uuid_generate_v4() 生成唯一的 ID
  word text not null,                                -- 词汇或句子
  lang text not null,                                -- 语言，使用完整的语音名称（如 'en-US-EricNeural'）
  audio_url text,                                    -- 语音文件的 URL，指向存储桶中的文件
  created_at timestamp with time zone default now()  -- 记录创建时间
);
