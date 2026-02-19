import sqlite3

def check_schema():
    conn = sqlite3.connect('easyjobs.db')
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print("Columns in 'users' table:")
        for col in columns:
            print(col)
        
        cursor.execute("PRAGMA table_info(applications)")
        columns = cursor.fetchall()
        print("\nColumns in 'applications' table:")
        for col in columns:
            print(col)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_schema()
