import subprocess
import sys
import time
import os
import signal

def run_app():
    # Path to frontend directory
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')
    
    print("🚀 Starting Chat App...")
    
    # Start Flask Backend
    print("   [1/2] Starting Flask Backend (port 5000)...")
    backend = subprocess.Popen([sys.executable, 'server.py'], cwd=os.getcwd())
    
    # Start React Frontend
    print("   [2/2] Starting React Frontend (port 5173)...")
    # check if npm is installed (shell=True for windows compatibility)
    npm_cmd = 'npm.cmd' if os.name == 'nt' else 'npm'
    frontend = subprocess.Popen([npm_cmd, 'run', 'dev'], cwd=frontend_dir)
    
    print("\n✅ App is running!")
    print("👉 Open http://localhost:5173 to chat")
    print("   (Press Ctrl+C to stop both servers)\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend.terminate()
        frontend.terminate()
        sys.exit(0)

if __name__ == '__main__':
    run_app()
