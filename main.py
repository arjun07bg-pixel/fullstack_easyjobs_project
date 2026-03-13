import sys
import os
import importlib.util

# Add both root and backend folder to path so all imports resolve correctly
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load backend/main.py directly using its file path to avoid self-import confusion
# (this file is also called 'main.py', so "from main import app" would import itself)
_backend_main_path = os.path.join(backend_dir, "main.py")
_spec = importlib.util.spec_from_file_location("backend_main", _backend_main_path)
if _spec is None or _spec.loader is None:
    raise ImportError(f"Could not load backend/main.py from: {_backend_main_path}")
_backend_main = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_backend_main)  # type: ignore[union-attr]

app = _backend_main.app  # noqa: F401 - Vercel looks for 'app'

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
