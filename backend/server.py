import urllib.parse
from fastapi import FastAPI, Request, HTTPException # 导入 Request 和 HTTPException
from fastapi.responses import JSONResponse
import edge_tts
import uuid, os
from supabase import create_client, Client
import urllib.parse
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging

load_dotenv()

app = FastAPI()

# 设置跨域请求支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 Supabase 客户端
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 配置日志记录，确保能被 Render 捕捉到
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

# ----------------- 【修改后的 TTS 请求处理】 -----------------
@app.post("/tts/")
async def tts(request: Request): # 1. 修改函数签名，接收原始 Request
    # 2. 添加详细的日志和完整的 try-except 块
    logger.info("--- 调试：已成功进入 /tts/ 端点函数内部。 ---")
    
    local_filename = None # 用于确保在任何失败情况下都能尝试删除文件

    try:
        # 3. 手动解析表单数据
        form_data = await request.form()
        text = form_data.get("text")
        lang_from_form = form_data.get("lang")
        
        # 提供一个默认值，以防前端未提供 lang
        lang = lang_from_form if lang_from_form else "en-US-EricNeural"
        
        logger.info(f"--- 调试：已成功解析表单数据。Text: '{text}', Lang: '{lang}' ---")

        # 4. 关键数据校验
        if not text:
            logger.warning("--- 调试：数据验证失败，'text' 字段缺失或为空。 ---")
            raise HTTPException(status_code=422, detail="表单数据中缺少 'text' 字段。")

        # 校验传入的语言是否有效 (这是您原有的逻辑)
        lang = lang.strip()
        if lang not in VALID_VOICES:
            logger.warning(f"--- 调试：无效的 voice: '{lang}' ---")
            return JSONResponse({"error": f"无效 voice: '{lang}'"}, status_code=400)

        # ---- 从这里开始是您原有的核心业务逻辑，现在被包裹在 try-except 中 ----

        filename = f"temp_{uuid.uuid4()}.mp3"
        local_filename = filename # 将文件名存起来以便 finally 中使用
        storage_path = f"tts/{filename}" # 在 Supabase 中使用不含特殊字符的文件名更安全

        # 检查文件是否已存在于 Supabase (此逻辑可以简化或移除，因为UUID文件名几乎不可能重复)
        # 为简化调试，暂时注释掉文件检查
        # logger.info(f"--- 调试：检查文件 {storage_path} 是否已存在... ---")
        # existing_files = supabase.storage.from_("tts").list("tts")
        # if any(f['name'] == filename for f in existing_files):
        #     logger.info(f"--- 调试：文件已存在，直接返回URL。 ---")
        #     public_url = supabase.storage.from_("tts").get_public_url(storage_path)
        #     return JSONResponse({"url": public_url})

        # 生成 TTS 音频
        logger.info(f"--- 调试：正在使用 edge-tts 生成音频: {local_filename} ---")
        communicate = edge_tts.Communicate(text, voice=lang)
        await communicate.save(local_filename)
        logger.info(f"--- 调试：成功在本地生成音频: {local_filename} ---")
        
        # 上传音频到 Supabase
        with open(local_filename, "rb") as f:
            logger.info(f"--- 调试：正在上传文件到 Supabase: {storage_path} ---")
            # Supabase Python v1 的上传方法是 file_options，不是字典
            supabase.storage.from_("tts").upload(file=f, path=storage_path, file_options={"cache-control": "3600", "upsert": "true"})
        
        public_url = supabase.storage.from_("tts").get_public_url(storage_path)
        logger.info(f"--- 调试：文件上传成功，URL: {public_url} ---")

        # 将文件的 URL 插入到数据库
        logger.info("--- 调试：正在将记录插入数据库... ---")
        supabase.table("tts_audio").insert({
            "word": text,
            "lang": lang,
            "audio_url": public_url
        }).execute()
        logger.info("--- 调试：数据库插入成功。 ---")

        return JSONResponse({"url": public_url})

    except Exception as e:
        # 5. 捕获所有可能的异常并记录详细信息
        logger.error(f"--- 调试：/tts/ 端点内部发生了一个错误: {e}", exc_info=True)
        # exc_info=True 会打印完整的错误堆栈，这对于调试至关重要
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {e}")
    
    finally:
        # 6. 确保无论成功或失败，本地的临时文件都会被删除
        if local_filename and os.path.exists(local_filename):
            logger.info(f"--- 调试：正在删除本地临时文件: {local_filename} ---")
            os.remove(local_filename)