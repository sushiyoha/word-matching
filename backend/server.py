import urllib.parse
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import edge_tts
import uuid
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging
import traceback # 导入 traceback 模块以获取更详细的错误堆栈

load_dotenv()

app = FastAPI()

# ... (您的 CORS 和其他 app 设置保持不变)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (Supabase 客户端初始化和常量定义保持不变)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

VALID_VOICES = [
    "en-US-EricNeural", "zh-CN-XiaoxiaoNeural", "ja-JP-DaichiNeural", "ko-KR-BongJinNeural",
    "fr-FR-AlainNeural", "de-DE-AmalaNeural", "es-ES-NilNeural", "ru-RU-DariyaNeural",
    "it-IT-BenignoNeural", "pt-PT-DuarteNeural", "ar-SA-HamedNeural", "th-TH-AcharaNeural",
    "vi-VN-HoaiMyNeural", "hi-IN-AaravNeural",
]
# ... (其他辅助函数和端点保持不变)

@app.post("/tts/")
async def tts(request: Request):
    logger.info("--- 调试：进入 /tts/ 端点。 ---")
    
    # 在 Render 等环境中，推荐使用 /tmp 目录存放临时文件
    # os.getcwd() 是当前工作目录，而 /tmp 是专门为临时文件设计的
    temp_dir = "/tmp" 
    os.makedirs(temp_dir, exist_ok=True) # 确保目录存在
    local_path = None # 初始化变量，用于 finally 块中的清理

    try:
        form_data = await request.form()
        text = form_data.get("text")
        lang = form_data.get("lang", "en-US-EricNeural") # 提供默认值，使代码更健壮
        
        logger.info(f"--- 调试：已解析表单。Text: '{text}', Lang: '{lang}' ---")

        if not text or not text.strip():
            logger.warning("--- 调试：数据验证失败，'text' 字段为空。 ---")
            raise HTTPException(status_code=422, detail="表单数据中 'text' 字段不能为空。")

        if lang not in VALID_VOICES:
            logger.warning(f"--- 调试：无效的 voice: '{lang}' ---")
            raise HTTPException(status_code=400, detail=f"无效的 voice: '{lang}'")

        # 1. 生成本地临时文件
        filename = f"{uuid.uuid4()}.mp3"
        local_path = os.path.join(temp_dir, filename) # 组合成完整的本地路径
        
        logger.info(f"--- 调试：准备使用 edge-tts 生成音频到本地路径: {local_path} ---")
        communicate = edge_tts.Communicate(text, lang)
        await communicate.save(local_path)
        logger.info(f"--- 调试：成功在本地生成音频: {local_path} ---")

        # 2. 上传到 Supabase
        storage_path = f"tts/{filename}" # 在 Supabase 中的存储路径
        with open(local_path, "rb") as f:
            logger.info(f"--- 调试：正在上传文件到 Supabase Storage: {storage_path} ---")
            # Supabase Python v2 的推荐上传方式
            supabase.storage.from_("tts").upload(path=storage_path, file=f, file_options={"content-type": "audio/mpeg"})
            logger.info("--- 调试：文件上传成功。---")

        # 3. 获取公开 URL
        public_url = supabase.storage.from_("tts").get_public_url(storage_path)
        logger.info(f"--- 调试：获取到公开 URL: {public_url} ---")

        # 4. (可选) 将记录存入数据库
        try:
            logger.info("--- 调试：正在将记录插入数据库... ---")
            supabase.table("tts_audio").insert({
                "word": text,
                "lang": lang,
                "audio_url": public_url
            }).execute()
            logger.info("--- 调试：数据库插入成功。 ---")
        except Exception as db_error:
            # 如果数据库插入失败，这不应阻止音频URL的返回。只记录一个警告。
            logger.warning(f"--- 调试：数据库插入失败，但不影响主要流程。错误: {db_error} ---")

        return JSONResponse({"url": public_url})

    except edge_tts.exceptions.NoAudioReceived as e:
        # 专门捕获这个最关键的错误，给出更详细的日志
        logger.error(f"--- 调试：edge-tts 核心错误：未能接收到音频流。Text: '{text}', Lang: '{lang}'. 错误: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail="语音合成服务暂时不可用，未能从上游获取音频。")

    except Exception as e:
        # 捕获所有其他未知错误
        # 使用 traceback.format_exc() 可以获取完整的错误堆栈字符串
        error_stack = traceback.format_exc()
        logger.error(f"--- 调试：/tts/ 端点发生未知错误: {e}\n{error_stack} ---")
        raise HTTPException(status_code=500, detail=f"服务器内部发生未知错误。")
    
    finally:
        # 确保无论成功或失败，本地的临时文件都会被删除
        if local_path and os.path.exists(local_path):
            try:
                os.remove(local_path)
                logger.info(f"--- 调试：成功删除本地临时文件: {local_path} ---")
            except OSError as e:
                logger.error(f"--- 调试：删除临时文件 {local_path} 时出错: {e} ---")