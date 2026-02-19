import sqlite3

def update_nulls():
    conn = sqlite3.connect('easyjobs.db')
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET phone_number = '0000000000' WHERE phone_number IS NULL OR phone_number = ''")
        print(f"Updated {cursor.rowcount} users with default phone number.")
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_nulls()
