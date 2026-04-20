import os
import sys

# Add backend directory to sys.path to ensure local imports work
parent_dir = os.path.dirname(os.path.abspath(__file__))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.database import Base, engine
from routers import users, admins, jobs, applications, filters, status, companies, top_companies_filters, auth, contact, saved_jobs, notifications, stats, interviews

app = FastAPI(
    title="EasyJobs API",
    version="2.0.0",
    contact={
        "name": "EasyJobs",
        "url": "http://127.0.0.1:8000",
    }
)

from fastapi.exceptions import RequestValidationError

# ── Exception Handlers ──────────────────────────────────────────
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        return await http_exception_handler(request, exc)
    print(f"GLOBAL ERROR: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Backend Error: {str(exc)}", "type": type(exc).__name__},
        headers={"Access-Control-Allow-Origin": "*"}
    )

# ── CORS ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ────────────────────────────────────────────────────
# Create database tables lazily on startup to prevent crashing on Vercel
@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized.")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# ── API Routers (MUST be before static file mounts) ─────────────
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(admins.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(filters.router, prefix="/api")
app.include_router(status.router, prefix="/api")
app.include_router(top_companies_filters.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(saved_jobs.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")

# ── HTML Page Routes ────────────────────────────────────────────
project_root = os.path.dirname(parent_dir)

@app.get("/")
async def root():
    # Try different possible locations for index.html
    possible_paths = [
        os.path.join(project_root, "index.html"),
        os.path.join(os.getcwd(), "index.html"),
        "index.html"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            return FileResponse(path)
    
    return JSONResponse({
        "error": "index.html not found", 
        "cwd": os.getcwd(), 
        "root": project_root
    }, status_code=404)

@app.get("/index.html")
async def index_html():
    return await root()

# ── Static Files (AFTER all routes) ────────────────────────────
# Use /tmp for uploads on Vercel
if os.getenv("VERCEL"):
    uploads_dir = "/tmp/uploads"
else:
    uploads_dir = os.path.join(project_root, "uploads")

if not os.path.exists(uploads_dir):
    try:
        os.makedirs(uploads_dir, exist_ok=True)
    except Exception as e:
        print(f"Warning: Could not create uploads dir: {e}")

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Frontend static files (HTML/JS/CSS)
frontend_dir = os.path.join(project_root, "frontend")
if os.path.exists(frontend_dir):
    app.mount("/frontend", StaticFiles(directory=frontend_dir), name="frontend")
else:
    # Fallback to local search if project_root is weird
    alt_frontend = os.path.join(os.getcwd(), "frontend")
    if os.path.exists(alt_frontend):
         app.mount("/frontend", StaticFiles(directory=alt_frontend), name="frontend")