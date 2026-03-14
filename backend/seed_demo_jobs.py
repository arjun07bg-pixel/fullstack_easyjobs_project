import sys
import os

# Add the current directory to sys.path so we can import models and database
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, Base
from models.job import Job
from database.database import engine

def seed_demo():
    # Force output to a file for debugging
    f = open("seed_output.txt", "w", encoding="utf-8")
    sys.stdout = f
    sys.stderr = f
    print(f"Connecting to: {engine.url}")
    sys.stdout.flush()
    db = SessionLocal()
    try:
        # Define the demo jobs matching the frontend static cards
        demo_jobs = [
            # IT & Software (201-204)
            {"job_id": 201, "job_title": "Senior Frontend Developer (React/Next.js)", "company_name": "Google India", "location": "Bangalore", "category": "software", "salary": 2500000, "experience_level": 4},
            {"job_id": 202, "job_title": "Backend Lead (Java/Spring Boot)", "company_name": "Amazon Dev Center", "location": "Hyderabad", "category": "software", "salary": 3000000, "experience_level": 5},
            {"job_id": 203, "job_title": "Full Stack Web Developer (MERN)", "company_name": "Microsoft Corporation", "location": "Pune / Remote", "category": "software", "salary": 1800000, "experience_level": 2},
            {"job_id": 204, "job_title": "Cloud DevOps Engineer", "company_name": "NVIDIA India", "location": "Bangalore", "category": "software", "salary": 2200000, "experience_level": 3},
            
            # Sales & Marketing (301-304)
            {"job_id": 301, "job_title": "Digital Marketing Manager", "company_name": "BrandBoost Solutions", "location": "Bangalore", "category": "marketing", "salary": 1200000, "experience_level": 5},
            {"job_id": 302, "job_title": "Enterprise Sales Director", "company_name": "GrowthMax Enterprises", "location": "Mumbai", "category": "marketing", "salary": 2500000, "experience_level": 10},
            {"job_id": 303, "job_title": "Brand Head", "company_name": "VenturePro Consulting", "location": "Delhi", "category": "marketing", "salary": 1800000, "experience_level": 8},
            {"job_id": 304, "job_title": "SEO Growth Specialist", "company_name": "SearchPro Digital", "location": "Remote", "category": "marketing", "salary": 800000, "experience_level": 3},

            # Finance & Accounting (401-404)
            {"job_id": 401, "job_title": "Senior Financial Analyst", "company_name": "Goldman Sachs", "location": "Bangalore", "category": "finance", "salary": 1800000, "experience_level": 5},
            {"job_id": 402, "job_title": "Chartered Accountant (Audit)", "company_name": "KPMG India", "location": "Mumbai", "category": "finance", "salary": 1400000, "experience_level": 4},
            {"job_id": 403, "job_title": "Investment Banking Associate", "company_name": "Morgan Stanley", "location": "Mumbai", "category": "finance", "salary": 2200000, "experience_level": 3},
            {"job_id": 404, "job_title": "Tax Consultant (Corporate)", "company_name": "Deloitte", "location": "Delhi", "category": "finance", "salary": 1000000, "experience_level": 2},

            # Engineering (501-504)
            {"job_id": 501, "job_title": "Structural Design Lead (Bridges)", "company_name": "Larsen & Toubro", "location": "Chennai", "category": "engineering", "salary": 1400000, "experience_level": 5},
            {"job_id": 502, "job_title": "Senior Mechanical Designer (EV)", "company_name": "Tata Motors (EV Research)", "location": "Pune", "category": "engineering", "salary": 1200000, "experience_level": 4},
            {"job_id": 503, "job_title": "Robotics & Automation Engineer", "company_name": "Reliance Industries", "location": "Jamnagar", "category": "engineering", "salary": 1500000, "experience_level": 3},
            {"job_id": 504, "job_title": "Power Systems Planning Engineer", "company_name": "PowerGrid Corp (India)", "location": "Gurgaon", "category": "engineering", "salary": 1800000, "experience_level": 5},
        ]

        print("Seeding demo jobs to satisfy foreign key constraints...")
        sys.stdout.flush()
        for job_data in demo_jobs:
            # Check if job exists
            existing = db.query(Job).filter(Job.job_id == job_data["job_id"]).first()
            if not existing:
                new_job = Job(**job_data)
                db.add(new_job)
                print(f"Added: {job_data['job_title']} (ID: {job_data['job_id']})")
                sys.stdout.flush()
            else:
                db.query(Job).filter(Job.job_id == job_data["job_id"]).update(job_data)
                print(f"Updated: {job_data['job_title']} (ID: {job_data['job_id']})")
                sys.stdout.flush()
        
        db.commit()
        print("Done!")
        sys.stdout.flush()
    except Exception as e:
        print(f"Error seeding: {e}")
        sys.stdout.flush()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo()
