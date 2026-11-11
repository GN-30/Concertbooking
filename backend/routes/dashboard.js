// backend/routes/dashboard.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";
import { getServerPrivacy } from "./artists.js";

const router = express.Router();

const isUuid = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const canViewCalendar = (targetUser, viewerId, viewerEmail, viewerUsername, viewerName) => {
  if (!targetUser) return true;

  const tId = String(targetUser.id || "").toLowerCase().trim();
  const tEmail = String(targetUser.email || "").toLowerCase().trim();
  const tUser = String(targetUser.username || "").toLowerCase().trim();
  const tName = String(targetUser.name || "").toLowerCase().trim();

  const vId = String(viewerId || "").toLowerCase().trim();
  const vEmail = String(viewerEmail || "").toLowerCase().trim();
  const vUser = String(viewerUsername || "").toLowerCase().trim();
  const vName = String(viewerName || "").toLowerCase().trim();

  // If viewing own calendar
  const isSelf = Boolean(
    (vId && tId && vId === tId) ||
    (vEmail && tEmail && vEmail === tEmail) ||
    (vUser && tUser && vUser === tUser) ||
    (vName && tName && vName === tName)
  );
  if (isSelf) return true;

  // Enrich with server privacy store
  const priv =
    getServerPrivacy(targetUser.id) ||
    getServerPrivacy(targetUser.email) ||
    getServerPrivacy(targetUser.username) ||
    getServerPrivacy(targetUser.name);

  const mode = priv?.calendar_visibility || targetUser.calendar_visibility || "public";
  const allowed = (priv?.calendar_allowed_users || targetUser.calendar_allowed_users || []).map((u) => String(u).toLowerCase().trim());
  const hidden = (priv?.calendar_hidden_users || targetUser.calendar_hidden_users || []).map((u) => String(u).toLowerCase().trim());

  if (mode === "private") return false;
  if (mode === "whitelist") {
    return allowed.some((u) => (vId && u === vId) || (vEmail && u === vEmail) || (vUser && u === vUser) || (vName && u === vName));
  }
  if (mode === "blacklist") {
    const isBlocked = hidden.some((u) => (vId && u === vId) || (vEmail && u === vEmail) || (vUser && u === vUser) || (vName && u === vName));
    return !isBlocked;
  }
  return true;
};

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const { id, email, username, all, viewer_id, viewer_email, viewer_username, viewer_name } = req.query;
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

      // Check calendar visibility for this viewer
      if (currentUser && !canViewCalendar(currentUser, viewer_id, viewer_email, viewer_username, viewer_name)) {
        return res.json({
          currentUser: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            email: currentUser.email,
            calendar_visibility: currentUser.calendar_visibility || "private",
          },
          isCalendarHidden: true,
          visibilityNotice: `${currentUser.name || "This artist"} has kept their calendar schedule private from your account.`,
          myConcerts: [],
          invitations: [],
          sentInvitations: [],
        });
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
