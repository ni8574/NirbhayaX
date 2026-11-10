import uvicorn
import sys
import os

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"======================================================")
    print(f"🤖 NIRBHAYA X AI MICROSERVICE STARTING ON PORT {port}")
    print(f"🛡️  Responsible AI: Face/Person Count ONLY (NO Recognition)")
    print(f"======================================================\n")
    try:
        uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
    except Exception as e:
        print(f"Error starting FastAPI uvicorn: {e}")
        sys.exit(1)
