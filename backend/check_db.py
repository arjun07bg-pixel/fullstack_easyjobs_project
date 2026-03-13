import sys
import os

from database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print('JOBS TABLE COLUMNS:')
    res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'jobs'"))
    cols = [row[0] for row in res]
    for c in cols:
        print(f" - {c}")
    
    print('\nAPPLICATIONS TABLE COLUMNS:')
    res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'applications'"))
    cols = [row[0] for row in res]
    for c in cols:
        print(f" - {c}")
