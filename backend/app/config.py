import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Detect serverless environment (e.g. Vercel, AWS Lambda)
IS_SERVERLESS = os.getenv("VERCEL") == "1" or os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None

# AI API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Database configuration
db_env = os.getenv("DATABASE_URL", "").strip()
if db_env and db_env != "sqlite:///./recycling_system.db":
    DATABASE_URL = db_env
elif IS_SERVERLESS:
    # Serverless environments like Vercel have a read-only root; /tmp is the writable storage
    DATABASE_URL = "sqlite:////tmp/recycling_system.db"
else:
    db_file_path = (BASE_DIR / "recycling_system.db").as_posix()
    DATABASE_URL = f"sqlite:///{db_file_path}"

# Upload directory
if IS_SERVERLESS:
    UPLOAD_DIR = Path("/tmp/uploads")
else:
    UPLOAD_DIR = BASE_DIR / "uploads"

try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    UPLOAD_DIR = Path("/tmp/uploads")
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
