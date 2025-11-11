import urllib.parse
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
import edge_tts
import uuid, os
from supabase import create_client, Client
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

VALID_VOICES = [
    "en-US-EricNeural","zh-CN-XiaoxiaoNeural","ja-JP-DaichiNeural","ko-KR-BongJinNeural",
    "fr-FR-AlainNeural","de-DE-AmalaNeural","es-ES-NilNeural","ru-RU-DariyaNeural",
    "it-IT-BenignoNeural","pt-PT-DuarteNeural","ar-SA-HamedNeural","th-TH-AcharaNeural",
    "vi-VN-HoaiMyNeural","hi-IN-AaravNeural",
]

def sanitize_filename(text: str):
    # URL 编码所有特殊字符
    return urllib.parse.quote_plus(text)

@app.get("/")
def hello():
    return {"status":"running"}

@app.post("/tts/")
async def tts(text: str = Form(...), lang: str = Form("en-US-EricNeural")):
    lang = lang.strip()
    if lang not in VALID_VOICES:
        return JSONResponse({"error": f"无效 voice: '{lang}'"}, status_code=400)

    safe_text = sanitize_filename(text)
    #filename = f"{lang}_{safe_text}.mp3"
    filename = f"temp_{uuid.uuid4()}.mp3"
    encoded_filename = urllib.parse.quote(filename)
    #storage_path = f"tts/{filename}"
    storage_path = f"tts/{encoded_filename}"

    # 先检查文件是否已经在 Supabase
    existing_files = supabase.storage.from_("tts").list("tts")
    if any(f['name'] == filename for f in existing_files):
        public_url = supabase.storage.from_("tts").get_public_url(storage_path)
        return JSONResponse({"url": public_url})

    # 文件不存在则生成
    try:
        communicate = edge_tts.Communicate(text, voice=lang)
        await communicate.save(filename)
    except Exception as e:
        return JSONResponse({"error": f"TTS 生成失败: {e}"}, status_code=500)

    # 上传
    try:
        with open(filename, "rb") as f:
            supabase.storage.from_("tts").upload(storage_path, f, {"cacheControl": "3600", "upsert": "true"})
        public_url = supabase.storage.from_("tts").get_public_url(storage_path)
    except Exception as e:
        os.remove(filename)
        return JSONResponse({"error": f"上传 Supabase 失败: {e}"}, status_code=500)

    os.remove(filename)
    return JSONResponse({"url": public_url})
