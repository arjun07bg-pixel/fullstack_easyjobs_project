import sys
import os

# Add parent directory to path so 'backend' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.main import app

# This is the entry point for Vercel
app = app
