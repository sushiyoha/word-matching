import urllib.parse
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
import edge_tts
import uuid, os
from supabase import create_client, Client
import urllib.parse
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

# 设置跨域请求支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有域访问（你可以限制为特定域）
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有请求头
)

# 初始化 Supabase 客户端
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 健康检查
@app.get("/health/")
def health_check():
    return {"status": "ok"}

# 支持的语言（声音选项）
VALID_VOICES = [
    "en-US-EricNeural", "zh-CN-XiaoxiaoNeural", "ja-JP-DaichiNeural", "ko-KR-BongJinNeural",
    "fr-FR-AlainNeural", "de-DE-AmalaNeural", "es-ES-NilNeural", "ru-RU-DariyaNeural",
    "it-IT-BenignoNeural", "pt-PT-DuarteNeural", "ar-SA-HamedNeural", "th-TH-AcharaNeural",
    "vi-VN-HoaiMyNeural", "hi-IN-AaravNeural",
]

# 文件名中的特殊字符 URL 编码
def sanitize_filename(text: str):
    return urllib.parse.quote_plus(text)

# 测试接口
@app.get("/")
def hello():
    return {"status": "running"}

# 处理 TTS 请求
@app.post("/tts/")
async def tts(text: str = Form(...), lang: str = Form("en-US-EricNeural")):
    # 校验传入的语言是否有效
    lang = lang.strip()
    if lang not in VALID_VOICES:
        return JSONResponse({"error": f"无效 voice: '{lang}'"}, status_code=400)

    # 安全处理文本
    safe_text = sanitize_filename(text)
    filename = f"temp_{uuid.uuid4()}.mp3"
    encoded_filename = urllib.parse.quote(filename)
    storage_path = f"tts/{encoded_filename}"

    # 检查文件是否已存在于 Supabase
    existing_files = supabase.storage.from_("tts").list()
    if any(f['name'] == encoded_filename for f in existing_files):
        public_url = supabase.storage.from_("tts").get_public_url(storage_path)
        return JSONResponse({"url": public_url})

    # 如果文件不存在，生成 TTS 音频
    try:
        communicate = edge_tts.Communicate(text, voice=lang)
        print(f"正在生成音频: {filename}")
        await communicate.save(filename)
        print(f"成功生成音频: {filename}")
    except Exception as e:
        return JSONResponse({"error": f"TTS 生成失败: {e}"}, status_code=500)

    # 上传音频到 Supabase
    try:
        with open(filename, "rb") as f:
            print(f"上传文件到 Supabase: {storage_path}")
            supabase.storage.from_("tts").upload(storage_path, f, {"cacheControl": "3600", "upsert": "true"})
        public_url = supabase.storage.from_("tts").get_public_url(storage_path)

        # 将文件的 URL 插入到数据库
        supabase.table("tts_audio").insert({
            "word": text,
            "lang": lang,
            "audio_url": public_url
        }).execute()

        print(f"文件上传成功: {public_url}")
        return JSONResponse({"url": public_url})
    except Exception as e:
        os.remove(filename)  # 上传失败时删除临时文件
        return JSONResponse({"error": f"上传 Supabase 失败: {e}"}, status_code=500)
    
    # 删除临时文件
    finally:
        if os.path.exists(filename):
            os.remove(filename)

    # 如果发生错误，确保返回默认错误信息
        return JSONResponse({"error": "未知错误"}, status_code=500)
