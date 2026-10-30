import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import CORS_ORIGINS, UPLOAD_DIR, GEMINI_API_KEY
from .database import init_db, engine
from .api import routes_classify, routes_history, routes_dashboard, routes_categories

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and directories
    init_db()
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="AI-Based Smart Recycling System API",
    description="Backend API for AI waste classification, recycling recommendations, history tracking, and waste management analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Register API routes
app.include_router(routes_classify.router)
app.include_router(routes_history.router)
app.include_router(routes_dashboard.router)
app.include_router(routes_categories.router)

@app.get("/")
def root():
    return {
        "system": "AI-Based Smart Recycling System API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    """System health check endpoint for monitoring API and service dependencies."""
    db_status = "connected"
    try:
        with engine.connect() as conn:
            pass
    except Exception as e:
        db_status = f"error: {str(e)}"

    ai_mode = "Gemini 2.5 Flash Vision API" if GEMINI_API_KEY else "Offline Computer Vision Feature Engine (Built-in)"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "ai_engine": ai_mode,
        "gemini_api_configured": bool(GEMINI_API_KEY),
        "version": "1.0.0"
    }
