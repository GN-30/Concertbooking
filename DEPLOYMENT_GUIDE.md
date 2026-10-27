# SwarSetu Deployment Guide: Vercel (Frontend) & Render (Backend)

This repository contains both the frontend (`vite-project/`) and backend (`backend/`) under the same repository.

---

## 📋 Overview

| Component | Platform | Root Directory | Build Command | Start/Output |
|---|---|---|---|---|
| **Backend API** | [Render](https://render.com) | `backend` | `npm install` | `npm start` |
| **Frontend UI** | [Vercel](https://vercel.com) | `vite-project` | `npm run build` | `dist` |
| **Database** | [Supabase](https://supabase.com) | — | — | Already active |

---

## 🚀 Step 1: Deploy Backend to Render

1. Go to **[dashboard.render.com](https://dashboard.render.com)** and sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository containing this project.
4. Fill in the deployment settings:
   - **Name**: `swarsetu-backend` (or any name you prefer)
   - **Region**: Closest to you (e.g., *Singapore* or *Frankfurt*)
   - **Root Directory**: `backend` ⚠️ *(Crucial: do not leave empty!)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Expand **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = `https://efnlzzmakfjgmmtveysu.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbmx6em1ha2ZqZ21tdHZleXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODkwOTksImV4cCI6MjEwODY2NTA5OX0.w_XEm3tzqArCwdlcppTi4GrmdJ1kL-LTRdmDE8GTb3c`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbmx6em1ha2ZqZ21tdHZleXN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzA4OTA5OSwiZXhwIjoyMTA4NjY1MDk5fQ.BdSZOsjv2t75YhpWsKkKq6mpWTLKHIkA0btIy_0uB64`
   - `CLIENT_URL` = `*` *(We will update this with your exact Vercel URL in Step 3)*
6. Click **Deploy Web Service**.
7. Once deployment finishes, copy your live backend URL (e.g. `https://swarsetu-backend.onrender.com`).
8. Verify it works by opening in your browser:
   `https://swarsetu-backend.onrender.com/api/health`

---

## 🌐 Step 2: Deploy Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. In the project configuration screen:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** and choose `vite-project` ⚠️ *(Crucial!)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_BACKEND_URL` = `https://swarsetu-backend.onrender.com` *(Paste your actual Render URL from Step 1)*
   - `VITE_SUPABASE_URL` = `https://efnlzzmakfjgmmtveysu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbmx6em1ha2ZqZ21tdHZleXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODkwOTksImV4cCI6MjEwODY2NTA5OX0.w_XEm3tzqArCwdlcppTi4GrmdJ1kL-LTRdmDE8GTb3c`
6. Click **Deploy**.
7. Vercel will build the project and output your live production URL (e.g. `https://swarsetu.vercel.app`).
   *(Note: The provided `vite-project/vercel.json` automatically handles SPA routing so refreshing `/dashboard`, `/schedule`, etc., works cleanly without 404s!)*

---

## 🔒 Step 3: Secure CORS on Render (Recommended)

1. In your **Render Dashboard** → click your `swarsetu-backend` service.
2. Go to **Environment**.
3. Edit `CLIENT_URL` and set it to your Vercel URL (e.g. `https://swarsetu.vercel.app`).
4. Click **Save Changes** — Render will automatically re-deploy with your locked-down origin.

---

## ✅ Deployment Checklist

- [x] `vite-project/vercel.json` created for SPA client-side routing.
- [x] Backend port configured with `process.env.PORT || 5000`.
- [x] `render.yaml` created for optional Render Blueprint 1-click deployment.
- [x] Flexible environment variables supported (`VITE_BACKEND_URL`).
- [x] Production build tested and verified (`✓ built in 18s`).
