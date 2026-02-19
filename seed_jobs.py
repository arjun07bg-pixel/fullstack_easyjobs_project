
import sqlite3

DB_PATH = "easyjobs.db"

def seed_jobs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    jobs = [
        ("Senior Software Engineer", "TCS", "Design and develop scalable web applications using modern frameworks.", "Chennai", 3, "Full Time", 12, "Hybrid"),
        ("Data Analyst", "Infosys", "Analyze complex datasets to provide actionable insights.", "Bangalore", 2, "Full Time", 8, "Office"),
        ("UX Designer", "Wipro", "Create intuitive user experiences for global clients.", "Hyderabad", 4, "Full Time", 15, "Remote"),
        ("Senior Frontend Developer", "Google India", "Build responsive web interfaces using React and modern JavaScript frameworks at scale.", "Bangalore", 5, "Full Time", 25, "Hybrid"),
        ("Back-End Developer", "CodeSphere Pvt Ltd", "Develop RESTful APIs using Node.js, Express, or Python Django.", "Chennai", 2, "Full Time", 7, "Hybrid"),
        ("Mechanical Design Engineer", "Larsen & Toubro", "Design and develop mechanical components using CAD tools.", "Mumbai", 2, "Full Time", 10, "Hybrid"),
        ("Sales Manager", "HDFC Bank", "Oversee and drive sales initiatives for financial products.", "Mumbai", 5, "Full Time", 12, "On-site"),
        ("HR Executive", "Reliance", "Manage recruitment and employee relations for a large-scale workforce.", "Mumbai", 2, "Full Time", 6, "On-site")
    ]

    try:
        # Check if jobs already exist to avoid duplicates
        cursor.execute("SELECT COUNT(*) FROM jobs")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("""
            INSERT INTO jobs (job_title, company_name, description, location, experience_level, job_type, salary, work_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, jobs)
            conn.commit()
            print("Successfully seeded 8 initial jobs.")
        else:
            print("Jobs already exist in database. Skipping seed.")
    except Exception as e:
        print(f"Error seeding jobs: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_jobs()
