// backend/routes/auth.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const router = express.Router();

// Fallback in-memory store if Supabase credentials are not yet entered
let localUsers = [
  { id: "a1", name: "S. Kumar", email: "kumar@mail.com", username: "skumar", role: "Vocalist", password: "123" },
  { id: "a2", name: "T. Ramesh", email: "ramesh@mail.com", username: "tramesh", role: "Mridangam", password: "123" },
  { id: "a3", name: "L. Priya", email: "priya@mail.com", username: "lpriya", role: "Harmonium", password: "123" },
];

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;
    if (!name || !email || !username) {
      return res.status(400).json({ error: "Name, email, and username are required." });
    }

    const assignedRole = role?.trim() || "Vocalist";

    if (isSupabaseConfigured) {
      // Check existing email/username
      const { data: existing } = await supabase
        .from("artists")
        .select("id")
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (existing) {
        return res.status(409).json({ error: "Email or username is already registered." });
      }

      const { data, error } = await supabase
        .from("artists")
        .insert([{
          name,
          email,
          username,
          password: password || "123456",
          role: assignedRole,
          bio: `Classical maestro specializing in ${assignedRole}.`,
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({
        message: "Artist registered successfully",
        artist: data,
        credentials: { username, password: password || "123456" },
      });
    }

    // Local fallback
    if (localUsers.some((u) => u.email === email || u.username === username)) {
      return res.status(409).json({ error: "Email or username is already registered." });
    }
    const newArtist = {
      id: `a_${Date.now()}`,
      name,
      email,
      username,
      password: password || "123456",
      role: assignedRole,
    };
    localUsers.push(newArtist);
    return res.status(201).json({
      message: "Artist registered successfully (local store)",
      artist: newArtist,
      credentials: { username, password: password || "123456" },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Username or email is required." });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .or(`email.eq.${identifier},username.eq.${identifier}`)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: "Artist profile not found." });
      }
      if (password && data.password && data.password !== password) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      return res.json({ message: "Login successful", user: data });
    }

    // Local fallback
    const user = localUsers.find(
      (u) => u.email === identifier || u.username === identifier
    );
    if (!user) {
      return res.status(404).json({ error: "Artist profile not found." });
    }
    return res.json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

export default router;
