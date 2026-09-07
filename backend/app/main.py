import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import engine
from app.db.base import init_db
from app.api.v1.api_router import api_router

# Initialize database schema
init_db(engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Institutional XAUUSD Decision Support Terminal. Educational decision-support tool only. Not financial advice.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for development & Render free hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Top-level health endpoints for pinging
@app.get("/health")
@app.get("/api/health")
def root_health():
    return {"status": "ok", "service": "XAUUSD Intelligence Terminal", "keepalive": True}

# Static file serving for unified single-service Render deployment
static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "out")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        target_file = os.path.join(static_dir, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"status": "Terminal API Active. Frontend build not present."}
else:
    @app.get("/")
    def root():
        return {
            "name": "XAUUSD Intelligence Terminal API",
            "status": "online",
            "docs": "/docs",
            "disclaimer": "Educational decision-support tool only. Not financial advice."
        }
