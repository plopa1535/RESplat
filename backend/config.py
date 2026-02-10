import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
CLIPS_DIR = STORAGE_DIR / "clips"
OUTPUT_DIR = STORAGE_DIR / "output"

REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
REPLICATE_MODEL = "minimax/video-01"
FFMPEG_PATH = os.getenv("FFMPEG_PATH", "ffmpeg")

VIDEO_DURATION = 10.0
VIDEO_WIDTH = 1280
VIDEO_HEIGHT = 720
VIDEO_FPS = 24
MAX_IMAGES = 5
MAX_IMAGE_SIZE_MB = 10
CLIP_MAX_DURATION = 6  # minimax/video-01 최대 6초

for d in [UPLOADS_DIR, CLIPS_DIR, OUTPUT_DIR]:
    d.mkdir(parents=True, exist_ok=True)
