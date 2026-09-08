import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import engine, Base, migrate_sqlite_schema
from backend.routes import auth, incidents, analytics, reports, ml
from backend.seed import seed_database
from backend.ml.model_manager import get_model_status
from backend.ml.train import run_training_pipeline

# 1. Run database schema migration for Hybrid AI columns
try:
    migrate_sqlite_schema()
except Exception as e:
    print(f"[WARN] Database migration check: {e}")

# 2. Create DB tables
Base.metadata.create_all(bind=engine)

# 3. Seed database on initial launch if empty
try:
    seed_database()
except Exception as e:
    print(f"[WARN] Database seed check: {e}")

# 4. Check & Bootstrap Machine Learning Model on startup
try:
    status = get_model_status()
    if not status.get("model_available", False):
        print("[INFO] No trained ML model found. Initializing bootstrap dataset and training v1.0.0 model...")
        run_training_pipeline(model_version="1.0.0")
    else:
        print(f"[INFO] SafeSense Hybrid ML Model v{status.get('model_version')} loaded successfully.")
except Exception as e:
    print(f"[WARNING] ML Model startup initialization failed: {e}. SafeSense will fallback to Rule Engine.")

app = FastAPI(
    title="SafeSense Hybrid AI API",
    description="AI-Powered Workplace Incident Detection & Response Platform (Rule-Based NLP + Random Forest ML)",
    version="1.1.0"
)

# Enable CORS (support environment variable ALLOWED_ORIGINS)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(ml.router)

@app.get("/api/health")
def health_check():
    status = get_model_status()
    return {
        "status": "online",
        "system": "SafeSense Hybrid Intelligence Engine",
        "version": "1.1.0",
        "ml_status": "active" if status.get("model_available") else "fallback_rule_based",
        "model_version": status.get("model_version", "1.0.0")
    }

# SPA Static Asset Serving for Single-Service Production Deployment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            return None
        target = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
