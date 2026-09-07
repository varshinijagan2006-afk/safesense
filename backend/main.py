import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import engine, Base
from backend.routes import auth, incidents, analytics, reports
from backend.seed import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

# Auto seed database on initial launch if empty
try:
    seed_database()
except Exception as e:
    print(f"Database seed check: {e}")

app = FastAPI(
    title="SafeSense AI API",
    description="AI-Powered Workplace Incident Detection & Response Platform API",
    version="1.0.0"
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

# Include Routers FIRST so /api endpoints take precedence
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(analytics.router)
app.include_router(reports.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "SafeSense Intelligence Engine",
        "version": "1.0.0"
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
        # Do not catch API paths if any slip through
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
