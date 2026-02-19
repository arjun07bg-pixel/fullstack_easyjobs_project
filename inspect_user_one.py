import sqlite3

conn = sqlite3.connect('easyjobs.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM users LIMIT 1")
row = cursor.fetchone()
print("First row:", row)

cursor.execute("PRAGMA table_info(users)")
print("Schema info:", cursor.fetchall())
conn.close()
