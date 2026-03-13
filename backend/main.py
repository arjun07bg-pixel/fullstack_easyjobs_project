import os
import sys

# Ensure both the project root and backend folder are in sys.path so imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

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
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

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
@app.get("/")
async def root():
    return FileResponse(os.path.join(parent_dir, "index.html"))

@app.get("/index.html")
async def index_html():
    return FileResponse(os.path.join(parent_dir, "index.html"))

# ── Static Files (AFTER all routes) ────────────────────────────
app.mount("/frontend", StaticFiles(directory=os.path.join(parent_dir, "frontend")), name="frontend")