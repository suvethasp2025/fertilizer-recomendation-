import os
import sys
# pyrefly: ignore [missing-import]
import uvicorn

# Inject parent directory into path so uvicorn can locate 'backend'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    # Start server on 127.0.0.1:8000
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
