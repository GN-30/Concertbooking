// backend/routes/sessions.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const router = express.Router();

const isUuid = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

let fallbackSessions = [];
let fallbackInvitations = [];

// GET /api/sessions
router.get("/", async (req, res) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return res.json(data || []);
    }
    return res.json(fallbackSessions);
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch sessions" });
  }
});

// POST /api/sessions (Create concert session & dispatch troupe invites)
router.post("/", async (req, res) => {
  try {
    const { concert_id, concert_title, venue, date_time, created_by, invites = [] } = req.body;

    if (!concert_title || !venue || !date_time) {
      return res.status(400).json({ error: "Concert title, venue, and date_time are required." });
    }

    if (isSupabaseConfigured) {
      // 1. Resolve organizer UUID
      let organizerUuid = null;
      let organizerName = "Sabha Organizer";
      if (isUuid(created_by)) {
        organizerUuid = created_by;
      } else if (created_by) {
        const { data: org } = await supabase
          .from("artists")
          .select("id, name")
          .eq("email", created_by)
          .maybeSingle();
        if (org) {
          organizerUuid = org.id;
          organizerName = org.name;
        }
      }

      // Check if concert_id is a valid UUID
      const validConcertId = isUuid(concert_id) ? concert_id : null;

      // 2. Insert into sessions table (matching user's exact schema)
      const sessionRow = {
        concert_title,
        venue,
        date_time: new Date(date_time).toISOString(),
      };
      if (validConcertId) sessionRow.concert_id = validConcertId;
      if (organizerUuid) sessionRow.created_by = organizerUuid;

      const { data: session, error: sessErr } = await supabase
        .from("sessions")
        .insert([sessionRow])
        .select()
        .single();

      if (sessErr) {
        console.error("Supabase session insert error:", sessErr);
        throw sessErr;
      }

      // 3. Resolve each invited artist's UUID and insert invitations
      if (invites.length > 0) {
        const inviteRows = [];
        const notificationRows = [];

        for (const inv of invites) {
          let artistUuid = null;
          let artistName = inv.name || inv.invited_user_name || "Artist";
          let artistEmail = inv.email || null;

          const rawId = inv.user_id || inv.invited_user_id || inv.id;
          if (isUuid(rawId)) {
            artistUuid = rawId;
          } else if (rawId) {
            // Find artist by email or username
            const { data: art } = await supabase
              .from("artists")
              .select("id, name, email")
              .or(`email.eq.${rawId},username.eq.${rawId}`)
              .maybeSingle();
            if (art) {
              artistUuid = art.id;
              artistName = art.name;
              artistEmail = art.email;
            }
          }

          // Disallow organizer / sender inviting themselves
          if (artistUuid && artistUuid !== organizerUuid) {
            inviteRows.push({
              session_id: session.id,
              invited_user_id: artistUuid,
              invited_user_name: artistName,
              sent_by: organizerUuid || null,
              sent_by_name: organizerName,
              concert_title,
              venue,
              date_time: new Date(date_time).toISOString(),
              role: inv.role || "Artist",
              priority: inv.priority || 1,
              status: "pending",
            });

            if (artistEmail) {
              notificationRows.push({
                to_email: artistEmail,
                message: `You are invited to perform as ${inv.role || "Artist"} at "${concert_title}" on ${new Date(date_time).toLocaleDateString()} (${venue}).`,
                session_id: session.id,
                is_read: false,
              });
            }
          }
        }

        let createdInvites = [];
        if (inviteRows.length > 0) {
          const { data: insInvites, error: invErr } = await supabase
            .from("invitations")
            .insert(inviteRows)
            .select();
          if (invErr) {
            console.error("Supabase invitations insert error:", invErr);
            throw invErr;
          }
          createdInvites = insInvites || [];
        }

        if (notificationRows.length > 0) {
          await supabase.from("notifications").insert(notificationRows);
        }

        return res.status(201).json({ session, invitations: createdInvites });
      }

      return res.status(201).json({ session, invitations: [] });
    }

    // Local fallback
    const newSession = {
      id: `sess_${Date.now()}`,
      concert_title,
      venue,
      date_time,
      created_by,
      created_at: new Date().toISOString(),
    };
    fallbackSessions.push(newSession);

    return res.status(201).json({ session: newSession, invitations: [] });
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ error: err.message || "Failed to create concert session" });
  }
});

export default router;
