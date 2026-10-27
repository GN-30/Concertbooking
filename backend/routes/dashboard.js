// backend/routes/dashboard.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const router = express.Router();

const isUuid = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const { id, email, username, all } = req.query;
    const target = id || email || username || "kumar@mail.com";
    const isAll = all === "true" || all === "1" || target === "all";

    if (isSupabaseConfigured) {
      if (isAll) {
        // Fetch all ensemble data
        const [sessionsRes, invitesRes] = await Promise.all([
          supabase.from("sessions").select("*").order("date_time", { ascending: true }),
          supabase.from("invitations").select("*").order("created_at", { ascending: false }),
        ]);

        return res.json({
          currentUser: {
            id: "all",
            name: "All Ensemble",
            role: "Classical Troupe Overview",
            email: "ensemble@swarsetu.com",
          },
          myConcerts: sessionsRes.data || [],
          invitations: invitesRes.data || [],
          sentInvitations: invitesRes.data || [],
        });
      }

      // 1. Resolve artist profile & UUID
      let currentUser = null;
      if (target && isUuid(target)) {
        const { data } = await supabase
          .from("artists")
          .select("*")
          .eq("id", target)
          .maybeSingle();
        currentUser = data;
      } else if (target) {
        const { data } = await supabase
          .from("artists")
          .select("*")
          .or(`email.eq.${target},username.eq.${target}`)
          .maybeSingle();
        currentUser = data;
      }

      if (!currentUser && target) {
        const { data } = await supabase
          .from("artists")
          .select("*")
          .or(`name.ilike.%${target}%,email.ilike.%${target}%`)
          .maybeSingle();
        currentUser = data;
      }

      if (!currentUser) {
        const { data } = await supabase.from("artists").select("*").limit(1).maybeSingle();
        currentUser = data;
      }

      const artistUuid = currentUser?.id && isUuid(currentUser.id) ? currentUser.id : null;

      let mySessions = [];
      let receivedInvites = [];
      let sentInvites = [];

      if (artistUuid) {
        const [sess, rec, sent] = await Promise.all([
          supabase
            .from("sessions")
            .select("*")
            .eq("created_by", artistUuid)
            .order("date_time", { ascending: true }),
          supabase
            .from("invitations")
            .select("*")
            .eq("invited_user_id", artistUuid)
            .order("date_time", { ascending: true }),
          supabase
            .from("invitations")
            .select("*")
            .eq("sent_by", artistUuid)
            .order("created_at", { ascending: false }),
        ]);

        mySessions = sess.data || [];
        receivedInvites = rec.data || [];
        sentInvites = sent.data || [];
      }

      return res.json({
        currentUser: currentUser || { name: "Maestro", email: target || "kumar@mail.com", role: "Classical Artist" },
        myConcerts: mySessions,
        invitations: receivedInvites,
        sentInvitations: sentInvites,
      });
    }

    // Local fallback
    if (isAll) {
      return res.json({
        currentUser: { id: "all", name: "All Ensemble", role: "Classical Troupe Overview", email: "ensemble@swarsetu.com" },
        myConcerts: [],
        invitations: [],
        sentInvitations: [],
      });
    }

    return res.json({
      currentUser: { name: "S. Kumar", email: target, role: "Vocalist" },
      myConcerts: [],
      invitations: [],
      sentInvitations: [],
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: err.message || "Failed to load dashboard" });
  }
});

export default router;
