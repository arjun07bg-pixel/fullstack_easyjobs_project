import sys
import os

# Add both root and backend folder to path so all imports resolve correctly
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the app from backend/main.py
try:
    from backend.main import app
except ImportError:
    # If standard import fails, try relative or alternative
    try:
        from main import app
    except ImportError:
        # Fallback for Vercel internal structure
        sys.path.append(os.path.join(os.getcwd(), "backend"))
        from main import app

# This is what Vercel looks for
app = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
