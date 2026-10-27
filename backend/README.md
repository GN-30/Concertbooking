# 🪕 SwarSetu Backend API Server

Backend service for **SwarSetu — Indian Classical Concert & Troupe Scheduling Platform**.
Built with Node.js, Express, and Supabase PostgreSQL.

---

## 🚀 Quick Setup & Local Execution

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` (or edit `backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
CLIENT_URL=http://localhost:5173
```

### 3. Run Server
```bash
# Development (with auto-reload on Node 18+)
npm run dev

# Or Production
npm start
```

The API will be live at `http://localhost:5000`.

---

## 🗄️ Setting Up Supabase Database

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project (e.g. `swarsetu-db`).
3. In the left navigation, click **SQL Editor** -> **New Query**.
4. Open the SQL file provided at `vite-project/supabase_schema.sql` (or copy from below).
5. Click **Run**. All tables (`artists`, `sessions`, `invitations`, `notifications`), RLS policies, and seed classical maestros will be created!
6. Go to **Project Settings** -> **API** to copy your **Project URL** and **anon public key**.
7. Paste them into `backend/.env` (and optionally `vite-project/.env`).

---

## 🌐 Deploying to Production (Render / Railway / Fly.io)

### Option A: Render (Recommended — Free & Easiest)
1. Push this repository to GitHub.
2. Sign in to [render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following fields:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY`: `your-anon-key`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app` (or `*`)
6. Click **Deploy Web Service**! Render will give you a live URL like `https://swarsetu-backend.onrender.com`.

### Option B: Railway
1. Sign in to [railway.app](https://railway.app) and select **New Project** -> **Deploy from GitHub repo**.
2. Set root directory to `backend`.
3. Add environment variables in the Railway dashboard.
4. Railway will automatically detect Node.js and run `npm start`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and available routes |
| `GET` | `/api/health` | Healthcheck and Supabase connectivity status |
| `POST` | `/api/auth/register` | Register new artist with custom dynamic role |
| `POST` | `/api/auth/login` | Login with username/email and password |
| `GET` | `/api/artists` | Get all artists (supports `?role=...&q=...`) |
| `GET` | `/api/artists/:id` | Get single artist by ID |
| `PUT` | `/api/artists/:id` | Update artist profile details |
| `GET` | `/api/sessions` | Get all scheduled concerts |
| `POST` | `/api/sessions` | Create concert & dispatch troupe invitations |
| `GET` | `/api/invitations` | Get invitations (supports `?user_email=...`) |
| `PATCH` | `/api/invitations/:id` | Accept or reject invitation (`status: 'accepted'`) |
| `GET` | `/api/dashboard` | Aggregated dashboard data (calendar concerts, stats) |
| `GET` | `/api/notifications` | Get user notifications (`?email=...`) |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read |
