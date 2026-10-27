// backend/routes/notifications.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const router = express.Router();

let fallbackNotifications = [];

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    if (isSupabaseConfigured) {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (email) {
        query = query.eq("to_email", email);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.json(data || []);
    }

    let list = [...fallbackNotifications];
    if (email) list = list.filter((n) => n.to_email === email);
    return res.json(list);
  } catch (err) {
    console.error("Notifications error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    }

    const item = fallbackNotifications.find((n) => n.id === id);
    if (item) item.is_read = true;
    return res.json(item || { success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: err.message || "Failed to update notification" });
  }
});

export default router;
