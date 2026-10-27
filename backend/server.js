// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import artistRoutes from "./routes/artists.js";
import sessionRoutes from "./routes/sessions.js";
import invitationRoutes from "./routes/invitations.js";
import dashboardRoutes from "./routes/dashboard.js";
import notificationRoutes from "./routes/notifications.js";
import { isSupabaseConfigured } from "./supabaseClient.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting local Vite ports and deployed frontend
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for easy cloud deployment
    },
    credentials: true,
  })
);

app.use(express.json());

// Health Check & Welcome Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "SwarSetu Indian Classical Concert Platform — Backend API",
    version: "1.0.0",
    supabaseConfigured: isSupabaseConfigured,
    endpoints: [
      "/api/auth/register",
      "/api/auth/login",
      "/api/artists",
      "/api/sessions",
      "/api/invitations",
      "/api/dashboard",
      "/api/notifications",
      "/api/health",
    ],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🪕 SwarSetu Backend Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  console.log(`⚡ Supabase Configured: ${isSupabaseConfigured ? "YES ✅" : "NO (Using local fallback) ⚠️"}`);
  console.log(`======================================================\n`);
});
