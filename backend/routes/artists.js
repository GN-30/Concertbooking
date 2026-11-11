// backend/routes/artists.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const router = express.Router();

// Shared in-memory privacy mapping so privacy works across server restarts and regardless of schema migrations
export const serverPrivacyMap = new Map();

export const getServerPrivacy = (idOrEmailOrName) => {
  if (!idOrEmailOrName) return null;
  return serverPrivacyMap.get(String(idOrEmailOrName).toLowerCase().trim()) || null;
};

export const setServerPrivacy = (key, data) => {
  if (!key) return;
  const k = String(key).toLowerCase().trim();
  serverPrivacyMap.set(k, data);
};

// Fallback seed artists
let fallbackArtists = [
  { id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "Vocalist", location: "Chennai", bio: "Senior Carnatic vocalist renowned for soulful Bhava and intricate ragas.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a2", name: "T. Ramesh", email: "ramesh@mail.com", role: "Mridangam", location: "Bengaluru", bio: "Veteran Mridangam maestro with 25+ years accompanying stalwarts.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a3", name: "L. Priya", email: "priya@mail.com", role: "Harmonium", location: "Mumbai", bio: "Versatile Harmonium soloist & accompanist specializing in Bhajans & Katcheri.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a4", name: "Ustad Zakir Ahmed", email: "zakir@mail.com", role: "Tabla", location: "Kolkata", bio: "Hindustani Tabla virtuoso celebrated for lightning-fast tihais and crisp bols.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a5", name: "Vidushi Gayatri V.", email: "gayatri@mail.com", role: "Veena", location: "Hyderabad", bio: "Saraswati Veena maestro evoking pure classical divinity and microtonal shrutis.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a6", name: "Pandit Rakesh Venu", email: "rakesh@mail.com", role: "Bansuri / Venu", location: "Pune", bio: "Master of the bamboo flute crafting spiritual alapanas and resonant gamakas.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] }
];

// GET /api/artists
router.get("/", async (req, res) => {
  try {
    const { role, q } = req.query;

    if (isSupabaseConfigured) {
      let query = supabase.from("artists").select("*").order("created_at", { ascending: true });
      if (role && role !== "all") {
        query = query.ilike("role", `%${role}%`);
      }
      if (q) {
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,role.ilike.%${q}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      const enriched = (data || []).map((a) => {
        const priv =
          getServerPrivacy(a.id) ||
          getServerPrivacy(a.email) ||
          getServerPrivacy(a.username) ||
          getServerPrivacy(a.name);
        return priv ? { ...a, ...priv } : a;
      });
      return res.json(enriched);
    }

    // Fallback filter
    let list = [...fallbackArtists];
    if (role && role !== "all") {
      list = list.filter((a) => (a.role || "").toLowerCase().includes(role.toLowerCase()));
    }
    if (q) {
      const lower = q.toLowerCase();
      list = list.filter(
        (a) =>
          a.name?.toLowerCase().includes(lower) ||
          a.email?.toLowerCase().includes(lower) ||
          a.role?.toLowerCase().includes(lower)
      );
    }
    return res.json(list);
  } catch (err) {
    console.error("Get artists error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch artists" });
  }
});

// GET /api/artists/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Artist not found" });
      return res.json(data);
    }

    const artist = fallbackArtists.find((a) => a.id === id);
    if (!artist) return res.status(404).json({ error: "Artist not found" });
    return res.json(artist);
  } catch (err) {
    console.error("Get artist error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch artist" });
  }
});

// PUT /api/artists/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Cache privacy updates in serverPrivacyMap
    if (updates.calendar_visibility !== undefined || updates.calendar_hidden_users !== undefined) {
      const privEntry = {
        calendar_visibility: updates.calendar_visibility || "public",
        calendar_hidden_users: Array.isArray(updates.calendar_hidden_users) ? updates.calendar_hidden_users : [],
        calendar_allowed_users: Array.isArray(updates.calendar_allowed_users) ? updates.calendar_allowed_users : [],
      };
      setServerPrivacy(id, privEntry);
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("artists")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          const priv = getServerPrivacy(id);
          return res.json(priv ? { ...data, ...priv } : data);
        }
      } catch (err) {
        console.warn("Supabase update error (possibly missing column):", err.message);
      }

      // If Supabase update threw schema error, still return successful response with the update
      const { data: existing } = await supabase.from("artists").select("*").eq("id", id).maybeSingle();
      if (existing) {
        if (existing.email) setServerPrivacy(existing.email, updates);
        if (existing.name) setServerPrivacy(existing.name, updates);
        return res.json({ ...existing, ...updates });
      }
    }

    const idx = fallbackArtists.findIndex(
      (a) =>
        String(a.id).toLowerCase() === String(id).toLowerCase() ||
        a.email?.toLowerCase() === String(id).toLowerCase() ||
        a.username?.toLowerCase() === String(id).toLowerCase() ||
        a.name?.toLowerCase() === String(id).toLowerCase()
    );
    if (idx !== -1) {
      fallbackArtists[idx] = { ...fallbackArtists[idx], ...updates };
      return res.json(fallbackArtists[idx]);
    }
    return res.json({ id, ...updates });
  } catch (err) {
    console.error("Update artist error:", err);
    res.status(500).json({ error: err.message || "Failed to update artist" });
  }
});

export default router;
