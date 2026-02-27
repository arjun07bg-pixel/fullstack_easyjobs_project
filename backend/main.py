
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
 
app = FastAPI(title="EasyJobs Backend FASTAPI")

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

@app.get("/api/health")
async def health_check():
    return {"status": "running", "database": "connected"}

# HTML Routes 
@app.get("/")
@app.get("/index.html")
@app.get("/home.html")
async def read_home(request: Request):
    # Prefer index.html as the primary entry point
    if os.path.exists("index.html"):
        return templates.TemplateResponse("index.html", {"request": request})
    return templates.TemplateResponse("home.html", {"request": request})

@app.api_route("/login", methods=["GET", "POST"])
@app.api_route("/login.html", methods=["GET", "POST"])
async def read_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.api_route("/register", methods=["GET", "POST"])
@app.api_route("/register.html", methods=["GET", "POST"])
async def read_register(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/test-registration")
async def test_registration(request: Request):
    return templates.TemplateResponse("test_registration.html", {"request": request})

@app.get("/dashboard")
@app.get("/dashboard.html")
async def read_dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/application-status")
@app.get("/application_status")
@app.get("/application_status.html")
async def read_app_status(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/jobs")
@app.get("/jobs.html")
async def read_jobs(request: Request):
    return templates.TemplateResponse("jobs.html", {"request": request})

@app.get("/companies")
@app.get("/companies.html")
async def read_companies(request: Request):
    return templates.TemplateResponse("companies.html", {"request": request})

@app.api_route("/contact", methods=["GET", "POST"])
@app.api_route("/contact.html", methods=["GET", "POST"])
async def read_contact(request: Request):
    return templates.TemplateResponse("contact.html", {"request": request})

@app.get("/Guidance")
@app.get("/Guidance.html")
async def read_guidance(request: Request):
    return templates.TemplateResponse("Guidance.html", {"request": request})

@app.get("/about")
@app.get("/about.html")
async def read_about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

@app.api_route("/post-job", methods=["GET", "POST"])
@app.api_route("/Postjob_home.html", methods=["GET", "POST"])
async def read_post_job(request: Request):
    return templates.TemplateResponse("Postjob_home.html", {"request": request})

@app.get("/profile")
@app.get("/profile.html")
async def read_profile(request: Request):
    return templates.TemplateResponse("profile.html", {"request": request})

@app.api_route("/apply", methods=["GET", "POST"])
@app.api_route("/apply_home.html", methods=["GET", "POST"])
async def read_apply(request: Request):
    return templates.TemplateResponse("apply_home.html", {"request": request})

@app.get("/my-applications")
@app.get("/my_applications")
@app.get("/my_applications.html")
async def read_my_applications(request: Request):
    return templates.TemplateResponse("my_applications.html", {"request": request})

@app.get("/engineering")
@app.get("/Engineering.html")
async def read_engineering(request: Request):
    return templates.TemplateResponse("Engineering.html", {"request": request})

@app.get("/it-software")
@app.get("/IT_software.html")
async def read_it_software(request: Request):
    return templates.TemplateResponse("IT_software.html", {"request": request})

@app.get("/finance")
@app.get("/Finance&accounting.html")
async def read_finance(request: Request):
    return templates.TemplateResponse("Finance&accounting.html", {"request": request})

@app.get("/marketing")
@app.get("/sales&marketing.html")
async def read_marketing(request: Request):
    return templates.TemplateResponse("sales&marketing.html", {"request": request})

@app.get("/internship")
@app.get("/internship.html")
async def read_internship(request: Request):
    return templates.TemplateResponse("internship.html", {"request": request})

@app.get("/accenture-jobs")
async def read_accenture(request: Request):
    # It was moved to top-companies/Accenture.html
    return templates.TemplateResponse("top-companies/Accenture.html", {"request": request})

@app.get("/success")
@app.get("/success.html")
@app.get("/submit")
@app.get("/submit.html")
async def read_success(request: Request):
    return templates.TemplateResponse("submit.html", {"request": request})

# Routers (All prefixed with /api to avoid conflict with HTML routes)
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
