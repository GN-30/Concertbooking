// backend/routes/artists.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const router = express.Router();

// Fallback seed artists
let fallbackArtists = [
  { id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "Vocalist", location: "Chennai", bio: "Senior Carnatic vocalist renowned for soulful Bhava and intricate ragas." },
  { id: "a2", name: "T. Ramesh", email: "ramesh@mail.com", role: "Mridangam", location: "Bengaluru", bio: "Veteran Mridangam maestro with 25+ years accompanying stalwarts." },
  { id: "a3", name: "L. Priya", email: "priya@mail.com", role: "Harmonium", location: "Mumbai", bio: "Versatile Harmonium soloist & accompanist specializing in Bhajans & Katcheri." },
  { id: "a4", name: "Ustad Zakir Ahmed", email: "zakir@mail.com", role: "Tabla", location: "Kolkata", bio: "Hindustani Tabla virtuoso celebrated for lightning-fast tihais and crisp bols." },
  { id: "a5", name: "Vidushi Gayatri V.", email: "gayatri@mail.com", role: "Veena", location: "Hyderabad", bio: "Saraswati Veena maestro evoking pure classical divinity and microtonal shrutis." },
  { id: "a6", name: "Pandit Rakesh Venu", email: "rakesh@mail.com", role: "Bansuri / Venu", location: "Pune", bio: "Master of the bamboo flute crafting spiritual alapanas and resonant gamakas." }
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
      return res.json(data || []);
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

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("artists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    const idx = fallbackArtists.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: "Artist not found" });
    fallbackArtists[idx] = { ...fallbackArtists[idx], ...updates };
    return res.json(fallbackArtists[idx]);
  } catch (err) {
    console.error("Update artist error:", err);
    res.status(500).json({ error: err.message || "Failed to update artist" });
  }
});

export default router;
