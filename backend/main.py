
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
from backend.database.database import Base, engine
from backend.routers import users, admins, jobs, applications, filters, status, companies, top_companies_filters, auth, contact, saved_jobs


from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
 
app = FastAPI(
    title="EasyJobs Professional API",
    
    version="2.0.0",
    contact={
        "name": "EasyJobs",
        "url": "http://127.0.0.1:8000",
    }
)

# Handler for expected HTTP errors (like 401 Incorrect Password)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
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
    )

# Robust CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/frontend/javascript", StaticFiles(directory="frontend/javascript"), name="javascript")
app.mount("/frontend/styles", StaticFiles(directory="frontend/styles"), name="styles")
app.mount("/frontend/pages", StaticFiles(directory="frontend/pages"), name="pages")

templates = Jinja2Templates(directory=[".", "frontend/pages"])

@app.on_event("startup")
async def startup_event():    
    # 1. Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # 2. Fix PostgreSQL schema if columns are missing
    try:
        from backend.fix_db import fix_database
        fix_database()
    except Exception as e:
        print(f"PostgreSQL Fix Skip: {e}")

@app.get("/api/health", tags=["System"])
async def health_check():
    return {"status": "running", "database": "connected"}

# HTML Routes 
@app.get("/", include_in_schema=False)
@app.get("/index.html", include_in_schema=False)
@app.get("/home.html", include_in_schema=False)
async def read_home(request: Request):
    if os.path.exists("index.html"):
        return templates.TemplateResponse("index.html", {"request": request})
    return templates.TemplateResponse("home.html", {"request": request})

@app.api_route("/login", methods=["GET", "POST"], include_in_schema=False)
@app.api_route("/login.html", methods=["GET", "POST"], include_in_schema=False)
async def read_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.api_route("/register", methods=["GET", "POST"], include_in_schema=False)
@app.api_route("/register.html", methods=["GET", "POST"], include_in_schema=False)
async def read_register(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/dashboard", include_in_schema=False)
@app.get("/dashboard.html", include_in_schema=False)
async def read_dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/jobs", include_in_schema=False)
@app.get("/jobs.html", include_in_schema=False)
async def read_jobs(request: Request):
    return templates.TemplateResponse("jobs.html", {"request": request})

@app.get("/companies", include_in_schema=False)
@app.get("/companies.html", include_in_schema=False)
async def read_companies(request: Request):
    return templates.TemplateResponse("companies.html", {"request": request})

@app.api_route("/post-job", methods=["GET", "POST"], include_in_schema=False)
@app.api_route("/Postjob_home.html", methods=["GET", "POST"], include_in_schema=False)
async def read_post_job(request: Request):
    return templates.TemplateResponse("Postjob_home.html", {"request": request})

@app.get("/profile", include_in_schema=False)
@app.get("/profile.html", include_in_schema=False)
async def read_profile(request: Request):
    return templates.TemplateResponse("profile.html", {"request": request})

@app.api_route("/apply", methods=["GET", "POST"], include_in_schema=False)
@app.api_route("/apply_home.html", methods=["GET", "POST"], include_in_schema=False)
async def read_apply(request: Request):
    return templates.TemplateResponse("apply_home.html", {"request": request})

@app.get("/my-applications", include_in_schema=False)
@app.get("/my_applications", include_in_schema=False)
@app.get("/my_applications.html", include_in_schema=False)
async def read_my_applications(request: Request):
    return templates.TemplateResponse("my_applications.html", {"request": request})

@app.get("/internship", include_in_schema=False)
@app.get("/internship.html", include_in_schema=False)
async def read_internship(request: Request):
    return templates.TemplateResponse("internship.html", {"request": request})

# Routers (All prefixed with /api to avoid conflict with HTML routes)
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

# --- DYNAMIC CATCH-ALL ROUTE ---
# Handles any page requested automatically in root or top-companies folder.
@app.get("/{filename:path}")
async def catch_all_html(filename: str, request: Request):
    if filename.startswith("api/") or filename == "favicon.ico":
        raise HTTPException(status_code=404)
        
    clean_name = filename.strip("/")
    if not clean_name:
        return templates.TemplateResponse("index.html", {"request": request})

    # If the path already has frontend/pages, strip it for template lookup if needed
    # but Jinja2Templates handles it with the directory list
    
    html_name = clean_name if clean_name.endswith(".html") else f"{clean_name}.html"
    
    # Check if the file exists in root or frontend/pages
    possible_paths = [
        html_name,
        f"frontend/pages/{html_name}",
        f"frontend/pages/top-companies/{html_name}"
    ]
    
    for p in possible_paths:
        if os.path.exists(p):
            # Template lookup is relative to the directory list provided to Jinja2Templates
            if p.startswith("frontend/pages/"):
                template_path = p.replace("frontend/pages/", "")
                return templates.TemplateResponse(template_path, {"request": request})
            return templates.TemplateResponse(p, {"request": request})

    return templates.TemplateResponse("index.html", {"request": request})
