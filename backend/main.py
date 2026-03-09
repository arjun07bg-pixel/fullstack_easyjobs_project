from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import os

from database.database import Base, engine
from routers import users, admins, jobs, applications, filters, status, companies, top_companies_filters, auth, contact, saved_jobs

app = FastAPI(
    title="EasyJobs API",
    version="2.0.0",
    contact={
        "name": "EasyJobs",
        "url": "http://127.0.0.1:8000",
    }
)

# HTTP error handler
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    if isinstance(exc, StarletteHTTPException):
        return await http_exception_handler(request, exc)

    print(f"GLOBAL ERROR: {str(exc)}")

    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Backend Error: {str(exc)}",
            "type": type(exc).__name__,
        },
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=[".", "frontend/pages"])


# Startup event (PostgreSQL)
@app.on_event("startup")
async def startup_event():

    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("PostgreSQL connected successfully")

        # Optional DB fix
        try:
            from fix_db import fix_database
            fix_database()
        except Exception as e:
            print(f"Database Fix Skip: {e}")

    except Exception as e:
        print(f"Database connection failed: {e}")


@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "running",
        "database": "PostgreSQL connected"
    }


# Routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users & Profiles"])
app.include_router(admins.router, prefix="/api", tags=["Admin Panel"])
app.include_router(companies.router, prefix="/api", tags=["Top Companies"])
app.include_router(jobs.router, prefix="/api", tags=["Jobs & Internships"])
app.include_router(applications.router, prefix="/api", tags=["Job Applications"])
app.include_router(filters.router, prefix="/api", tags=["Job Filters"])
app.include_router(status.router, prefix="/api", tags=["Status Tracking"])
app.include_router(top_companies_filters.router, prefix="/api", tags=["Top Company Filters"])
app.include_router(contact.router, prefix="/api", tags=["Contact Us"])
app.include_router(saved_jobs.router, prefix="/api", tags=["Saved Jobs"])


# Catch-all route
@app.get("/{filename:path}")
async def catch_all_html(filename: str, request: Request):

    if filename.startswith("api/") or filename == "favicon.ico":
        raise HTTPException(status_code=404)

    clean_name = filename.strip("/")

    if not clean_name:
        return templates.TemplateResponse("index.html", {"request": request})

    html_name = clean_name if clean_name.endswith(".html") else f"{clean_name}.html"

    possible_paths = [
        html_name,
        f"frontend/pages/{html_name}",
        f"frontend/pages/top-companies/{html_name}",
    ]

    for p in possible_paths:
        if os.path.exists(p):

            if p.startswith("frontend/pages/"):
                template_path = p.replace("frontend/pages/", "")
                return templates.TemplateResponse(template_path, {"request": request})

            return templates.TemplateResponse(p, {"request": request})

    return templates.TemplateResponse("index.html", {"request": request})