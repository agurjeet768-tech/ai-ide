# 🧠 AI IDE — Full Stack Setup Guide

Browser-based AI IDE with Monaco editor, AI chat, file manager, and live logs.
**Backend**: HuggingFace Space (FastAPI) | **Frontend**: Next.js (Vercel)

---

## 📁 Project Structure

```
ai-ide/
├── backend/          ← HuggingFace Space (FastAPI)
│   ├── app.py        ← Main API (models, chat, files, logs)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
├── frontend/         ← Next.js app (Vercel)
│   ├── src/
│   │   ├── app/      ← Next.js pages
│   │   ├── components/  ← IDE panels
│   │   └── lib/      ← API client + store
│   ├── package.json
│   └── .env.example
└── vercel.json
```

---

## 🚀 Step 1: Deploy Backend on HuggingFace

### 1.1 Create a HuggingFace Account
- Go to https://huggingface.co and sign up (free)

### 1.2 Create a New Space
1. Go to: https://huggingface.co/new-space
2. **Space name**: `ai-ide-backend`
3. **SDK**: Select **Docker**
4. **Visibility**: Public
5. Click **Create Space**

### 1.3 Upload Backend Files
Upload these 4 files from the `backend/` folder to your Space:
- `app.py`
- `requirements.txt`
- `Dockerfile`
- `README.md`

You can drag-drop them in the HF web UI under "Files" tab.

### 1.4 Add HuggingFace API Key (Secret)
1. In your Space → **Settings** → **Repository Secrets**
2. Add secret: **Name**: `HF_API_KEY`, **Value**: your HF API key
   - Get your key at: https://huggingface.co/settings/tokens
   - Create a token with **Read** permission (free)

### 1.5 Your Backend URL
After deploying (~2 mins), your backend URL will be:
```
https://YOUR_HF_USERNAME-ai-ide-backend.hf.space
```
**Save this URL** — you need it for Step 2.

---

## 🌐 Step 2: Deploy Frontend on Vercel

### 2.1 Push to GitHub
```bash
# In the ai-ide/ root folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-ide.git
git push -u origin main
```

### 2.2 Deploy on Vercel
1. Go to: https://vercel.com and sign in with GitHub
2. Click **Add New Project** → Import your `ai-ide` repo
3. **Root Directory**: Set to `frontend`
4. **Framework Preset**: Next.js (auto-detected)
5. Under **Environment Variables**, add:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://YOUR_HF_USERNAME-ai-ide-backend.hf.space`
6. Click **Deploy** 🚀

### 2.3 Your App URL
After ~1 minute: `https://ai-ide-YOUR_USERNAME.vercel.app`

---

## 💻 Local Development

### Backend (local)
```bash
cd backend
pip install -r requirements.txt
HF_API_KEY=your_key_here uvicorn app:app --reload --port 7860
```

### Frontend (local)
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_BACKEND_URL=http://localhost:7860
npm run dev
```
Open: http://localhost:3000

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Monaco Editor** | VS Code engine — syntax highlight, IntelliSense |
| **AI Chat** | Chat with HF models, markdown rendering |
| **AI Code Generate** | Insert AI-generated code into editor |
| **Model Switcher** | Switch between 6 free HF models instantly |
| **File Manager** | Create, edit, delete files in workspace |
| **Live Logs** | Real-time backend logs via WebSocket |
| **1-Click Copy** | Copy logs or AI responses instantly |
| **Health Dashboard** | Monitor backend & HF model status |
| **Auto-save indicator** | Dirty file tracking with save button |
| **Keyboard shortcuts** | Ctrl+S to save, Enter to send chat |

## 🤖 Available Models (Free & Unlimited)

| Model | Best For |
|-------|----------|
| DeepSeek Coder 7B | Code generation & debugging |
| CodeLlama 7B | Code completion |
| Mistral 7B | General chat & explanations |
| Phi-3 Mini | Fast, efficient tasks |
| StarCoder2 7B | Code completion |
| Zephyr 7B | Aligned chat |

---

## 🔧 Troubleshooting

**Model returns "loading" message**: HF free tier cold-starts models. Wait 20-30s and retry.

**Backend unreachable**: Check your HF Space is running (green status in HF dashboard).

**CORS errors**: The backend allows all origins by default. For production, set your Vercel URL in `app.py`.

**HF API key error**: Make sure you added `HF_API_KEY` in HF Space Secrets (not just env vars).
