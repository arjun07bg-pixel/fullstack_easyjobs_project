from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import Base, engine
from routers import users, admins, jobs, applications, filters, status, companies, top_companies_filters, auth, contact, saved_jobs

app = FastAPI(
    title="EasyJobs API",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://cosmic-bienenstitch-9618bb.netlify.app", "https://arjun07bg-pixel.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (runs on import for serverless)
Base.metadata.create_all(bind=engine)


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