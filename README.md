# 💬 PulseChat

A real-time chat application built with **React** (Vite) on the frontend and **Flask + Socket.IO** on the backend.

![PulseChat](https://img.shields.io/badge/PulseChat-v1.0-blueviolet?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)

---

## ✨ Features

- ⚡ Real-time messaging with WebSockets (Socket.IO)
- 🧑‍🤝‍🧑 Multi-user chat rooms
- 🎨 Modern, responsive UI
- 🚀 One-command local startup

---

## 🗂️ Project Structure

```
chatapp/
├── server.py           # Flask + Socket.IO backend
├── start.py            # One-command launcher (runs both servers)
├── requirements.txt    # Python dependencies
├── Procfile            # For Heroku / Render deployment
├── frontend/           # React (Vite) frontend
│   ├── src/
│   ├── public/
│   └── dist/           # Built frontend (served by Flask in production)
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.8+
- Node.js 18+ & npm

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Start the app
```bash
python start.py
```

This starts:
- 🔧 Flask backend on `http://localhost:5000`
- ⚛️ React frontend on `http://localhost:5173`

Open **http://localhost:5173** in your browser to start chatting!

Press `Ctrl+C` to stop both servers.

---

## 🔧 Running Servers Separately

| Service | Command | URL |
|---|---|---|
| Backend | `python server.py` | `http://localhost:5000` |
| Frontend | `cd frontend && npm run dev` | `http://localhost:5173` |

---

## 🌐 Deployment

See [`DEPLOY_INSTRUCTIONS.md`](./DEPLOY_INSTRUCTIONS.md) for full deployment steps on Render, Railway, Heroku, and VPS.

**Quick deploy on Render:**
1. Push this repo to GitHub
2. Connect the repo to [Render](https://render.com)
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `gunicorn server:app`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Socket.IO Client |
| Backend | Flask 3, Flask-SocketIO, Flask-CORS |
| Real-time | WebSockets via Socket.IO |
| Production | Gunicorn |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
