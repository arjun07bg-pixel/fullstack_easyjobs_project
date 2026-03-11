<<<<<<< HEAD
import os
import sys

# Ensure the project root is in sys.path so 'backend' package imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from backend.database.database import Base, engine
from backend.routers import users, admins, jobs, applications, filters, status, companies, top_companies_filters, auth, contact, saved_jobs
 
app = FastAPI(
    title="EasyJobs API",
    
    version="2.0.0",
    contact={
        "name": "EasyJobs",
        "url": "http://127.0.0.1:8000",
    }
)

from fastapi.exceptions import RequestValidationError

# Handler for expected HTTP errors (like 401 Incorrect Password)
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

# Global Exception Handler ONLY for unexpected crashes (500)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # If it's already an HTTPException, don't treat it as a crash
    if isinstance(exc, StarletteHTTPException):
        return await http_exception_handler(request, exc)
        
    print(f"GLOBAL ERROR: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Backend Error: {str(exc)}", "type": type(exc).__name__},
        headers={"Access-Control-Allow-Origin": "*"}
    )

# Robust CORS
=======
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import Base, engine
from routers import users, admins, jobs, applications, filters, status, companies, top_companies_filters, auth, contact, saved_jobs

app = FastAPI(
    title="EasyJobs API",
    version="2.0.0"
)

# CORS
>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cosmic-bienenstitch-9618bb.netlify.app", 
        "https://arjun07bg-pixel.github.io"
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# Mount static files
# Mount static files with absolute paths
app.mount("/frontend/javascript", StaticFiles(directory=os.path.join(parent_dir, "frontend", "javascript")), name="javascript")
app.mount("/frontend/styles", StaticFiles(directory=os.path.join(parent_dir, "frontend", "styles")), name="styles")
app.mount("/frontend/pages", StaticFiles(directory=os.path.join(parent_dir, "frontend", "pages")), name="pages")

# Use absolute paths for templates
templates = Jinja2Templates(directory=[parent_dir, os.path.join(parent_dir, "frontend", "pages")])
=======
# Create tables (runs on import for serverless)
Base.metadata.create_all(bind=engine)

>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f

@app.get("/")
def root():
    return {"message": "EasyJobs API Running"}

# Routers
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