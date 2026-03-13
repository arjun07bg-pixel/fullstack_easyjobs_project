import sqlite3
import os

def seed_jobs():
    db_path = "backend/easyjobs.db"
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # The jobs from jobs.js (a subset of the most popular ones)
    extra_jobs = [
        (1001, "Senior Software Engineer", "TCS", "Chennai", 3, 12, "Full Time", "Hybrid", "Design and develop scalable web applications using modern frameworks."),
        (1002, "Data Analyst", "Infosys", "Bangalore", 2, 8, "Full Time", "On-site", "Analyze complex datasets to provide actionable insights. Skills in SQL, Python, and Tableau required."),
        (1003, "UX Designer", "Wipro", "Hyderabad", 4, 15, "Full Time", "Remote", "Create intuitive user experiences for global clients."),
        (1004, "Backend Developer", "HCL Tech", "Noida", 3, 10, "Full Time", "Hybrid", "Build robust server-side logic and database schemas. Node.js and PostgreSQL preferred."),
        (1005, "Full Stack Developer", "Zoho", "Chennai", 1, 7, "Full Time", "On-site", "Join our core product team to build world-class SaaS applications."),
        (1006, "Mobile App Developer", "Freshworks", "Chennai", 2, 9, "Full Time", "Remote", "Develop high-performance iOS and Android applications."),
        (1007, "Cloud Architect", "LTIMindtree", "Mumbai", 5, 22, "Full Time", "Hybrid", "Architect and manage AWS/Azure infrastructure for enterprise clients."),
        (1008, "DevOps Engineer", "Tech Mahindra", "Pune", 3, 14, "Full Time", "Hybrid", "Implement CI/CD pipelines and manage containerized applications."),
        (1009, "Cybersecurity Analyst", "Cognizant", "Bangalore", 2, 11, "Full Time", "On-site", "Protect our clients digital assets from high-level threats."),
        (1010, "Product Manager", "Reliance Jio", "Mumbai", 5, 25, "Full Time", "On-site", "Lead product strategy for next-gen consumer applications."),
        (1011, "Software Engineering Intern", "Google", "Bangalore", 0, 1, "Internship", "Hybrid", "Learn state-of-the-art software development practices."),
        (1012, "Data Science Intern", "Microsoft", "Hyderabad", 0, 1, "Internship", "Remote", "Apply statistical and machine learning models to real datasets."),
        (1013, "Frontend Developer", "Adobe", "Noida", 2, 18, "Full Time", "On-site", "Work on world-class creative tools. Specialist in React and CSS animations."),
        (1014, "Business Analyst", "Deloitte", "Hyderabad", 3, 14, "Full Time", "Hybrid", "Translate business requirements into technical specifications."),
        (1015, "HR Manager", "Cognizant", "Chennai", 5, 16, "Full Time", "On-site", "Handle talent acquisition and employee relations for a large workforce."),
        (1016, "System Administrator", "Wipro", "Pune", 4, 12, "Full Time", "On-site", "Manage server infrastructure, network security, and user access controls."),
        (1017, "Marketing Specialist", "HubSpot", "Remote", 2, 11, "Full Time", "Remote", "Drive inbound marketing campaigns and manage social media presence."),
        (1018, "Java Developer", "Oracle", "Bangalore", 3, 20, "Full Time", "Hybrid", "Contribute to the development of enterprise-level Java applications."),
        (1019, "Content Writer", "Zomato", "Gurgaon", 1, 6, "Full Time", "On-site", "Create engaging content for the app and social media platforms."),
        (1020, "QA Automation Engineer", "Salesforce", "Hyderabad", 3, 15, "Full Time", "Hybrid", "Develop and execute automated test scripts using Selenium and Java."),
    ]

    print(f"Seeding {len(extra_jobs)} jobs into database...")

    for job in extra_jobs:
        try:
            # Check if exists
            cursor.execute("SELECT job_id FROM jobs WHERE job_id = ?", (job[0],))
            if cursor.fetchone():
                continue
            
            cursor.execute("""
                INSERT INTO jobs (job_id, job_title, company_name, location, experience_level, salary, job_type, work_mode, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, job)
        except Exception as e:
            print(f"Error seeding job {job[0]}: {e}")

    conn.commit()
    conn.close()
    print("✅ Database seeding complete. Saved jobs will now work for all listed jobs.")

if __name__ == "__main__":
    seed_jobs()
