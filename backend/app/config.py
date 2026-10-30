import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# AI API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Database configuration
db_env = os.getenv("DATABASE_URL", "").strip()
if not db_env or db_env == "sqlite:///./recycling_system.db":
    db_file_path = (BASE_DIR / "recycling_system.db").as_posix()
    DATABASE_URL = f"sqlite:///{db_file_path}"
else:
    DATABASE_URL = db_env

# Upload directory
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Image upload limits
MAX_IMAGE_SIZE_MB = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))
MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "bmp"}

# CORS settings
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
