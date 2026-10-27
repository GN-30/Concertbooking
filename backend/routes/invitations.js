// backend/routes/invitations.js
import express from "express";
import { supabase, isSupabaseConfigured } from "../supabaseClient.js";

const router = express.Router();

const isUuid = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

let fallbackInvitations = [];

// GET /api/invitations
router.get("/", async (req, res) => {
  try {
    const { user_email, user_id, status } = req.query;

    if (isSupabaseConfigured) {
      let query = supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });

      const identifier = user_email || user_id;
      if (identifier) {
        if (isUuid(identifier)) {
          query = query.or(`invited_user_id.eq.${identifier},sent_by.eq.${identifier}`);
        } else {
          // Look up artist by email
          const { data: art } = await supabase
            .from("artists")
            .select("id")
            .eq("email", identifier)
            .maybeSingle();
          if (art?.id) {
            query = query.or(`invited_user_id.eq.${art.id},sent_by.eq.${art.id}`);
          }
        }
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json(data || []);
    }

    let list = [...fallbackInvitations];
    if (user_email || user_id) {
      const identifier = user_email || user_id;
      list = list.filter((i) => i.invited_user_id === identifier || i.sent_by === identifier);
    }
    if (status) {
      list = list.filter((i) => i.status === status);
    }
    return res.json(list);
  } catch (err) {
    console.error("Get invitations error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch invitations" });
  }
});

// PATCH /api/invitations/:id (Accept or Reject invitation)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responder_id } = req.body; // 'accepted' or 'rejected'

    if (!status || !["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Valid status ('accepted', 'rejected') is required." });
    }

    if (isSupabaseConfigured) {
      if (responder_id) {
        const { data: currentInv } = await supabase
          .from("invitations")
          .select("invited_user_id")
          .eq("id", id)
          .maybeSingle();

        if (currentInv && currentInv.invited_user_id !== responder_id) {
          return res.status(403).json({ error: "Only the invited artist can accept or reject this invitation." });
        }
      }

      const { data, error } = await supabase
        .from("invitations")
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // When invitation is accepted, generate notification for the organizer
      if (status === "accepted" && data.sent_by) {
        const { data: org } = await supabase
          .from("artists")
          .select("email")
          .eq("id", data.sent_by)
          .maybeSingle();

        if (org?.email) {
          await supabase.from("notifications").insert([{
            to_email: org.email,
            message: `${data.invited_user_name || "An artist"} accepted the invitation to perform as ${data.role} for "${data.concert_title}". It has been placed on your calendar!`,
            invite_id: data.id,
            session_id: data.session_id,
            is_read: false,
          }]);
        }
      }

      return res.json({ message: `Invitation ${status} successfully`, invitation: data });
    }

    const idx = fallbackInvitations.findIndex((i) => i.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Invitation not found." });
    }
    fallbackInvitations[idx].status = status;
    return res.json({ message: `Invitation ${status} successfully`, invitation: fallbackInvitations[idx] });
  } catch (err) {
    console.error("Respond invitation error:", err);
    res.status(500).json({ error: err.message || "Failed to update invitation" });
  }
});

export default router;
