# PulseChat Deployment Guide (Manual Upload)

This folder is ready for deployment to any Python hosting service (Heroku, Render, Railway, DigitalOcean, etc.).

## Option 1: Render / Railway (Recommended)

1.  **Upload**: If you are not using GitHub, you might need to use the CLI or a "Drag & Drop" feature if available (unlikely for full apps). 
    *   **Better**: Create a private GitHub repo, upload these files, and connect Render to it.
    *   **Manual**: If your host supports ZIP upload, zip this entire folder (excluding `node_modules` and `venv`).

2.  **Configuration**:
    *   **Build Command**: `pip install -r requirements.txt`
        *   *(Note: You do NOT need to build the frontend. I already built it into `frontend/dist` for you!)*
    *   **Start Command**: `gunicorn server:app`

## Option 2: VPS / PythonAnywhere

1.  **Upload**: Upload this entire folder to your server.
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run Server**:
    ```bash
    gunicorn server:app
    ```
    *   The app will run on port 8000 by default. Set `PORT` env var if needed.

## Key Files
*   `server.py`: The main application entry point. Serves both API and Frontend.
*   `Procfile`: Used by Heroku/Render to start the app.
*   `frontend/dist`: The compiled React app (static files).

**Enjoy PulseChat!**
