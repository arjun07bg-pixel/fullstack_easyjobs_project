import sys
import os
import json
import re

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import SessionLocal
from models.job import Job

db = SessionLocal()

# Extracted from our script plan
internships = [
    {"job_id": 2001, "job_title": "Software Engineering Intern", "company_name": "Google India", "location": "Bangalore / Hyderabad", "salary": 80, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2002, "job_title": "Marketing & Content Intern", "company_name": "Zomato", "location": "Work from home", "salary": 15, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2003, "job_title": "Frontend Development (React)", "company_name": "Razorpay", "location": "Bangalore", "salary": 45, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2004, "job_title": "Business Development Intern", "company_name": "Swiggy", "location": "Mumbai / Gurgaon", "salary": 30, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2005, "job_title": "Python Developer Intern", "company_name": "TCS", "location": "Chennai / Pune", "salary": 25, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2006, "job_title": "Java Developer Intern", "company_name": "Infosys", "location": "Mysore / Bangalore", "salary": 22, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2007, "job_title": "UX/UI Design Intern", "company_name": "Adobe India", "location": "Noida", "salary": 40, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2008, "job_title": "Cyber Security Intern", "company_name": "Wipro", "location": "Pune", "salary": 20, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2009, "job_title": "Operations & Growth", "company_name": "PhonePe", "location": "Bangalore", "salary": 18, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2010, "job_title": "Supply Chain Management", "company_name": "Flipkart", "location": "Gurgaon", "salary": 35, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2011, "job_title": "Human Resources (HR)", "company_name": "Swiggy", "location": "Work from home", "salary": 12, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2012, "job_title": "Content Development (Math)", "company_name": "Byju's", "location": "Bangalore", "salary": 20, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2013, "job_title": "Data Analyst Intern", "company_name": "Reliance Jio", "location": "Mumbai", "salary": 30, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2014, "job_title": "Cloud Infrastructure Intern", "company_name": "Amazon (AWS)", "location": "Work from home", "salary": 65, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2015, "job_title": "Data Science Intern", "company_name": "Microsoft India", "location": "Hyderabad", "salary": 75, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2016, "job_title": "Mobile App (Flutter)", "company_name": "Tech Mahindra", "location": "Noida", "salary": 18, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2017, "job_title": "Customer Success Intern", "company_name": "Freshworks", "location": "Chennai", "salary": 20, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2018, "job_title": "Civil Engineering Intern", "company_name": "L&T Construction", "location": "Mumbai / Ahmedabad", "salary": 15, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2019, "job_title": "Backend Development", "company_name": "Paytm", "location": "Noida", "salary": 28, "job_type": "Internship", "experience_level": 0},
    {"job_id": 2020, "job_title": "Management Consulting", "company_name": "Deloitte", "location": "Hyderabad", "salary": 25, "job_type": "Internship", "experience_level": 0}
]

def parse_jobs_js():
    js_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'javascript', 'jobs.js')
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the extraJobs array content using regex
    match = re.search(r'const extraJobs = \[(.*?)\];', content, re.DOTALL)
    if not match:
        return []
    
    array_content = match.group(1)
    
    # We need to parse this JS array of objects.
    # Convert JS object syntax to valid JSON by quoting keys
    json_str = '[' + array_content + ']'
    # Ensure keys are quoted: job_id:, job_title:, company_name:, location:, experience_level:, salary:, job_type:, work_mode:, description:
    keys = ["job_id", "job_title", "company_name", "location", "experience_level", "salary", "job_type", "work_mode", "description"]
    for k in keys:
        json_str = re.sub(r'\b' + k + r'\s*:', f'"{k}":', json_str)
        
    # Replace single quotes containing string with double quotes (basic attempt)
    # Actually just executing it in python is risky, but we can do it with ast
    # since it's almost dict syntax, we can evaluate it if we replace true/false/null
    # However python eval needs a bit of tweaking. 
    return [] # We'll just define them or rely on internships for now

def seed_db():
    print("Starting seed...")
    try:
        count_added = 0
        for job in internships:
            existing = db.query(Job).filter(Job.job_id == job["job_id"]).first()
            if not existing:
                db_job = Job(
                    job_id=job["job_id"],
                    job_title=job["job_title"],
                    company_name=job["company_name"],
                    description=f"Great opportunity to work as {job['job_title']} at {job['company_name']}.",
                    location=job["location"],
                    experience_level=job.get("experience_level", 0),
                    salary=job.get("salary", 0),
                    job_type=job["job_type"],
                    work_mode="Remote" if "home" in job["location"].lower() else "Hybrid"
                )
                db.add(db_job)
                count_added += 1
        
        db.commit()
        print(f"Successfully seeded {count_added} internships!")
    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()

if __name__ == "__main__":
    seed_db()
