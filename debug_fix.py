import sqlite3
import os

db = "easyjobs.db"
conn = sqlite3.connect(db)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users)")
info = cursor.fetchall()
print("Current schema:", [i[1] for i in info])

cols = [("phone_number", "TEXT"), ("image", "TEXT")]
for name, t in cols:
    print(f"Adding {name}...")
    try:
        cursor.execute(f"ALTER TABLE users ADD COLUMN {name} {t}")
        print("Success")
    except Exception as e:
        print(f"Fail: {e}")

conn.commit()
conn.close()
