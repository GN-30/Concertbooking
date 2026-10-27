// src/services/api.js
// SwarSetu — Supabase-backed API (with localStorage fallback when Supabase not configured)

import { supabase } from "./supabase.js";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).replace(/\/$/, "");
const USE_BACKEND = Boolean(BACKEND_URL) && !BACKEND_URL.includes("placeholder");

const USE_SUPABASE =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  import.meta.env.VITE_SUPABASE_URL !== "https://your-project-id.supabase.co" &&
  import.meta.env.VITE_SUPABASE_URL !== "https://placeholder.supabase.co";

// ============================
// Local Database (in localStorage — used as fallback)
// ============================
let registeredArtists =
  JSON.parse(localStorage.getItem("artists")) ||
  [
    { id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "vocal", username: "skumar" },
    { id: "a2", name: "T. Ramesh", email: "ramesh@mail.com", role: "mrudangist", username: "tramesh" },
    { id: "a3", name: "L. Priya", email: "priya@mail.com", role: "harmonist", username: "lpriya" },
  ];

let invitations = JSON.parse(localStorage.getItem("invitations")) || [];
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let currentUserEmail =
  localStorage.getItem("currentUserEmail") || "kumar@mail.com";

function save() {
  localStorage.setItem("artists", JSON.stringify(registeredArtists));
  localStorage.setItem("invitations", JSON.stringify(invitations));
  localStorage.setItem("sessions", JSON.stringify(sessions));
  localStorage.setItem("currentUserEmail", currentUserEmail);
}

// ============================
// Helper — Fix local timezone ISO string
// ============================
function toLocalISOString(dateInput) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${min}`;
}

// ============================
// Current User
// ============================
export function getCurrentUser() {
  if (USE_SUPABASE) {
    const u = JSON.parse(localStorage.getItem("currentUserSupabase") || "null");
    if (u) return u;
  }
  const email = localStorage.getItem("currentUserEmail") || currentUserEmail;
  const localU = registeredArtists.find((a) => a.email === email || a.id === email);
  if (localU) return localU;
  return registeredArtists[0] || { id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "Vocalist" };
}

export function setCurrentUser(email) {
  currentUserEmail = email;
  save();
  try {
    window.dispatchEvent(new CustomEvent("swarsethu:userChanged", { detail: { email } }));
  } catch (e) {
    const ev = document.createEvent("Event");
    ev.initEvent("swarsethu:userChanged", true, true);
    window.dispatchEvent(ev);
  }
}

export function setCurrentUserObj(userObj) {
  localStorage.setItem("currentUserSupabase", JSON.stringify(userObj));
  currentUserEmail = userObj.email;
  localStorage.setItem("currentUserEmail", userObj.email);
  try {
    window.dispatchEvent(new CustomEvent("swarsethu:userChanged", { detail: { email: userObj.email } }));
  } catch (e) {}
}

// ============================
// Artist Management
// ============================
export async function registerArtist({ name, email, role, username, password }) {
  const pwd = password || "123456";
  const userRole = role?.trim() || "Vocalist";

  if (USE_BACKEND) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role: userRole, username, password: pwd }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to register artist");
      return json.artist;
    } catch (e) {
      console.warn("Backend unavailable, falling back to direct Supabase/local:", e.message);
    }
  }

  if (USE_SUPABASE) {
    // Check if username/email already exists
    const { data: existing } = await supabase
      .from("artists")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();
    if (existing) throw new Error("Email or username already registered.");

    const { data, error } = await supabase
      .from("artists")
      .insert([{
        name,
        email,
        role: userRole,
        username,
        password: pwd,
        bio: `Classical maestro specializing in ${userRole}.`,
      }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // LocalStorage fallback
  if (registeredArtists.find((a) => a.email === email || (username && a.username === username))) {
    throw new Error("Email or username already registered.");
  }
  const newArtist = {
    id: `a_${Date.now()}`,
    name,
    email,
    role: userRole,
    username: username || `user_${Date.now()}`,
    password: pwd,
  };
  registeredArtists.push(newArtist);
  save();
  return newArtist;
}

export async function getAllArtists() {
  if (USE_BACKEND) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/artists`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend unavailable, falling back:", e);
    }
  }
  if (USE_SUPABASE) {
    const { data, error } = await supabase.from("artists").select("*").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }
  return new Promise((resolve) => setTimeout(() => resolve([...registeredArtists]), 150));
}

export function updateArtistById(id, updates = {}) {
  if (USE_SUPABASE) {
    return supabase.from("artists").update(updates).eq("id", id).select().single()
      .then(({ data, error }) => { if (error) throw error; return data; });
  }
  const idx = registeredArtists.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  registeredArtists[idx] = { ...registeredArtists[idx], ...updates };
  save();
  return registeredArtists[idx];
}

export async function getArtists(role = "", q = "") {
  if (USE_BACKEND) {
    try {
      const url = `${BACKEND_URL}/api/artists?role=${encodeURIComponent(role)}&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend unavailable, falling back:", e);
    }
  }
  if (USE_SUPABASE) {
    let query = supabase.from("artists").select("*");
    if (role) query = query.eq("role", role);
    if (q) query = query.ilike("name", `%${q}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  const filtered = registeredArtists.filter(
    (a) =>
      (!role || a.role === role) &&
      (!q || a.name.toLowerCase().includes(q.toLowerCase()))
  );
  return new Promise((resolve) => setTimeout(() => resolve(filtered), 200));
}

export async function getByRole(role = "") {
  if (USE_SUPABASE) {
    let query = supabase.from("artists").select("*");
    if (role) query = query.eq("role", role.toLowerCase());
    const { data, error } = await query;
    if (error) throw error;
    return { artists: data || [], invitations: [] };
  }
  const artistsFiltered = registeredArtists.filter(
    (a) => !role || a.role.toLowerCase() === role.toLowerCase()
  );
  const invitesFiltered = invitations.filter(
    (inv) => !role || inv.role.toLowerCase() === role.toLowerCase()
  );
  return new Promise((resolve) =>
    setTimeout(() => resolve({ artists: artistsFiltered, invitations: invitesFiltered }), 200)
  );
}

// ============================
// Auth — login by email/username + password
// ============================
export async function loginArtist({ email, identifier, password }) {
  const loginId = (identifier || email || "").trim();
  if (!loginId) throw new Error("Please enter your email or username.");

  // 1. Try Backend Server API
  if (USE_BACKEND) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginId, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      setCurrentUserObj(json.user);
      return json.user;
    } catch (e) {
      console.warn("Backend login failed, trying Supabase direct:", e.message);
    }
  }

  // 2. Try Direct Supabase Connection (Supports both email & username)
  if (USE_SUPABASE) {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .or(`email.eq.${loginId},username.eq.${loginId}`)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("No artist account found with this email or username.");

    if (password && data.password && data.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }

    setCurrentUserObj(data);
    return data;
  }

  // 3. LocalStorage fallback
  const artist = registeredArtists.find(
    (a) =>
      (a.email?.toLowerCase() === loginId.toLowerCase() ||
        a.username?.toLowerCase() === loginId.toLowerCase()) &&
      (!a.password || !password || a.password === password)
  );
  if (!artist) throw new Error("No artist account found with these credentials.");
  setCurrentUser(artist.email);
  return artist;
}

// ============================
// Concerts
// ============================
export async function getConcerts() {
  if (USE_SUPABASE) {
    const { data, error } = await supabase.from("concerts").select("*");
    if (error) throw error;
    return data || [];
  }
  return [
    { id: "c1", title: "Ganesh Utsav — Evening Gala", description: "Festival concert", venue: "Town Hall" },
    { id: "c2", title: "Diwali Celebration — Main Stage", description: "Festival special", venue: "Main Stage" },
    { id: "c3", title: "Carnatic Fusion Night", description: "Cultural fusion concert", venue: "Music Academy" },
  ];
}

// ============================
// Create Session (Send Invites)
// ============================
export async function createSession(payload) {
  const sender = getCurrentUser();
  if (!sender) throw new Error("No current user found");
  if (!payload.venue || !payload.date_time) {
    throw new Error("Venue and Date/Time are mandatory to schedule a concert.");
  }

  // Filter out any self-invites
  const sanitizedInvites = (payload.invites || []).filter(
    (i) => i.user_id !== sender.id && i.email !== sender.email && i.name !== sender.name
  );
  payload = { ...payload, invites: sanitizedInvites };

  if (USE_SUPABASE) {
    // Check for conflicts
    const dateStr = new Date(payload.date_time).toISOString();
    const { data: existing } = await supabase
      .from("invitations")
      .select("invited_user_id")
      .eq("date_time", dateStr)
      .eq("status", "accepted")
      .in("invited_user_id", payload.invites.map((i) => i.user_id));
    if (existing && existing.length > 0) {
      throw new Error(`Artists already booked at this time: ${existing.map((e) => e.invited_user_id).join(", ")}`);
    }

    // Create session
    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .insert([{
        concert_id: payload.concert_id,
        concert_title: payload.concert_title,
        date_time: dateStr,
        venue: payload.venue,
        created_by: sender.id,
      }])
      .select()
      .single();
    if (sErr) throw new Error(sErr.message);

    // Create invitations
    const inviteRows = payload.invites.map((inv) => ({
      session_id: session.id,
      invited_user_id: inv.user_id,
      invited_user_name: inv.name || "",
      sent_by: sender.id,
      sent_by_name: sender.name,
      sent_by_role: sender.role,
      concert_id: payload.concert_id,
      concert_title: payload.concert_title,
      venue: payload.venue,
      date_time: dateStr,
      role: inv.role,
      priority: inv.priority,
      status: "pending",
    }));
    const { error: iErr } = await supabase.from("invitations").insert(inviteRows);
    if (iErr) throw new Error(iErr.message);
    return session;
  }

  // LocalStorage fallback
  const existingInvites = JSON.parse(localStorage.getItem("invitations")) || [];
  const conflicting = existingInvites.filter(
    (inv) =>
      inv.date_time === payload.date_time &&
      inv.status === "accepted" &&
      payload.invites.some((i) => i.user_id === inv.invited_user_id)
  );
  if (conflicting.length > 0) {
    const busyArtists = conflicting.map((c) => c.invited_user_id).join(", ");
    throw new Error(`Cannot send invites. Already booked: ${busyArtists}`);
  }

  let concertTitle = payload.concert_title || null;
  if (!concertTitle && payload.concert_id) {
    const concerts = await getConcerts();
    const found = concerts.find((c) => c.id === payload.concert_id);
    if (found) concertTitle = found.title;
  }
  concertTitle = concertTitle || "Untitled Concert";

  const session = {
    id: `s_${Date.now()}`,
    concert_id: payload.concert_id,
    concert_title: concertTitle,
    date_time: toLocalISOString(payload.date_time),
    venue: payload.venue,
    invites: payload.invites || [],
    created_by: sender.email,
    created_at: new Date().toISOString(),
  };
  sessions.push(session);

  payload.invites.forEach((inv) => {
    const artist = registeredArtists.find((a) => a.id === inv.user_id);
    invitations.push({
      id: `i_${Date.now()}_${inv.user_id}`,
      session_id: session.id,
      invited_user_id: inv.user_id,
      status: "pending",
      priority: inv.priority,
      role: inv.role,
      concert_id: payload.concert_id,
      title: `Invitation: ${concertTitle}`,
      sent_by: sender.email,
      sent_by_name: sender.name,
      sent_by_role: sender.role,
      created_at: new Date().toISOString(),
      venue: session.venue,
      concert_title: concertTitle,
      date_time: toLocalISOString(session.date_time),
      invited_user_name: artist ? artist.name : "Unknown",
    });
  });

  save();
  return session;
}

// ============================
// Dashboard Data (Supports viewing any artist's dashboard or all ensemble)
// ============================
export async function getDashboard(targetArtistOrId = null) {
  // 1. Check if viewing all ensemble overview
  if (targetArtistOrId === "all") {
    if (USE_BACKEND) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dashboard?all=true`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("Backend dashboard fetch failed:", e.message);
      }
    }
    if (USE_SUPABASE) {
      const [sessionsRes, invitesRes] = await Promise.all([
        supabase.from("sessions").select("*").order("date_time", { ascending: true }),
        supabase.from("invitations").select("*, sessions(*)").order("created_at", { ascending: false }),
      ]);
      return {
        currentUser: {
          id: "all",
          name: "All Ensemble",
          role: "Classical Troupe Overview",
          email: "ensemble@swarsetu.com",
        },
        myConcerts: sessionsRes.data || [],
        sentInvitations: invitesRes.data || [],
        invitations: invitesRes.data || [],
      };
    }
    return {
      currentUser: { id: "all", name: "All Ensemble", role: "Classical Troupe Overview", email: "ensemble@swarsetu.com" },
      myConcerts: sessions,
      sentInvitations: invitations,
      invitations: invitations,
    };
  }

  // 2. Resolve target artist
  let user = null;
  if (targetArtistOrId && typeof targetArtistOrId === "object" && (targetArtistOrId.id || targetArtistOrId.email)) {
    user = targetArtistOrId;
  } else if (typeof targetArtistOrId === "string" && targetArtistOrId && targetArtistOrId !== "me") {
    const all = await getAllArtists();
    user = all.find((a) => a.id === targetArtistOrId || a.email === targetArtistOrId || a.username === targetArtistOrId);
    if (!user && USE_SUPABASE) {
      const { data } = await supabase
        .from("artists")
        .select("*")
        .or(`id.eq.${targetArtistOrId},email.eq.${targetArtistOrId},username.eq.${targetArtistOrId}`)
        .maybeSingle();
      if (data) user = data;
    }
  }

  if (!user) {
    user = getCurrentUser();
  }
  if (!user) {
    user = { id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "Vocalist" };
  }

  // 3. Try Backend API
  if (USE_BACKEND) {
    try {
      const queryParam = user.id ? `id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email || "")}` : `email=${encodeURIComponent(user.email || "")}`;
      const res = await fetch(`${BACKEND_URL}/api/dashboard?${queryParam}`);
      if (res.ok) {
        const json = await res.json();
        return {
          ...json,
          currentUser: json.currentUser || user,
        };
      }
    } catch (e) {
      console.warn("Backend getDashboard failed, falling back to direct Supabase/localStorage:", e.message);
    }
  }

  // 4. Supabase Direct
  if (USE_SUPABASE) {
    const isUuid = (str) =>
      typeof str === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let artistUuid = isUuid(user.id) ? user.id : null;
    if (!artistUuid && user.email) {
      const { data: art } = await supabase
        .from("artists")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();
      if (art?.id) artistUuid = art.id;
    }

    if (artistUuid) {
      const [receivedRes, sentRes, sessionsRes] = await Promise.all([
        supabase.from("invitations").select("*").eq("invited_user_id", artistUuid).order("date_time", { ascending: true }),
        supabase.from("invitations").select("*").eq("sent_by", artistUuid).order("created_at", { ascending: false }),
        supabase.from("sessions").select("*").eq("created_by", artistUuid).order("date_time", { ascending: true }),
      ]);

      return {
        currentUser: user,
        myConcerts: sessionsRes.data || [],
        sentInvitations: sentRes.data || [],
        invitations: receivedRes.data || [],
      };
    }
  }

  // 5. LocalStorage Fallback
  const myReceived = invitations.filter((i) =>
    i.invited_user_id === user.id ||
    i.invited_user_id === user.email ||
    (user.name && i.invited_user_name === user.name)
  );
  const mySent = invitations.filter((i) =>
    i.sent_by === user.id ||
    i.sent_by === user.email ||
    (user.name && i.sent_by_name === user.name)
  );
  const mySessions = sessions.filter((s) =>
    s.created_by === user.id ||
    s.created_by === user.email
  );

  return {
    currentUser: user,
    myConcerts: mySessions,
    sentInvitations: mySent,
    invitations: myReceived,
  };
}

// ============================
// Respond to Invitation
// ============================
export async function respondInvitation(inviteId, status, responder = null) {
  const receiver = responder || getCurrentUser();

  if (USE_BACKEND) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/invitations/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, responder_id: receiver?.id }),
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn("Backend respondInvitation failed, trying direct Supabase:", e.message);
    }
  }

  if (USE_SUPABASE) {
    const { data: inv, error: fetchErr } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", inviteId)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);

    const { error: updateErr } = await supabase
      .from("invitations")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("id", inviteId);
    if (updateErr) throw new Error(updateErr.message);

    // Create notification for the sender
    const senderArtist = await supabase.from("artists").select("email").eq("id", inv.sent_by).single();
    const senderEmail = senderArtist.data?.email || "";
    const dateTime = inv.date_time ? new Date(inv.date_time).toLocaleString() : "N/A";
    await supabase.from("notifications").insert([{
      to_email: senderEmail,
      message: `${receiver.name} (${receiver.role}) has ${status} the invitation for "${inv.concert_title}" at ${inv.venue} on ${dateTime}`,
      invite_id: inviteId,
      session_id: inv.session_id,
    }]);
    return { invitation: { ...inv, status } };
  }

  // LocalStorage fallback
  const idx = invitations.findIndex((i) => i.id === inviteId);
  if (idx === -1) throw new Error("Invitation not found");
  invitations[idx].status = status;
  invitations[idx].responded_at = new Date().toISOString();

  const senderEmail = invitations[idx].sent_by;
  const concertTitle = invitations[idx].concert_title || invitations[idx].title || "Concert";
  const venue = invitations[idx].venue || "";
  const dateTime = invitations[idx].date_time
    ? new Date(invitations[idx].date_time).toLocaleString()
    : "N/A";

  const note = {
    id: `n_${Date.now()}`,
    to: senderEmail,
    message: `${receiver.name} (${receiver.role}) has ${status} the invitation for "${concertTitle}" at ${venue} on ${dateTime}`,
    time: new Date().toISOString(),
    invite_id: inviteId,
    session_id: invitations[idx].session_id,
  };
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  notifications.push(note);
  localStorage.setItem("notifications", JSON.stringify(notifications));
  save();
  return { invitation: invitations[idx] };
}

// ============================
// Notifications
// ============================
export async function getNotifications(emailOrId = null) {
  if (USE_SUPABASE) {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (emailOrId && emailOrId !== "all") {
      query = query.or(`to_email.eq.${emailOrId},to_email.ilike.%${emailOrId}%`);
    }

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  }

  const all = JSON.parse(localStorage.getItem("notifications")) || [];
  if (!emailOrId || emailOrId === "all") return [...all].reverse();
  return all.filter((n) => n.to === emailOrId || n.to_email === emailOrId).reverse();
}

export async function clearNotifications(email) {
  if (USE_SUPABASE) {
    await supabase.from("notifications").delete().eq("to_email", email);
    return;
  }
  const all = JSON.parse(localStorage.getItem("notifications")) || [];
  const filtered = all.filter((n) => n.to !== email);
  localStorage.setItem("notifications", JSON.stringify(filtered));
}

export async function getAllSessions() {
  if (USE_SUPABASE) {
    const { data } = await supabase.from("sessions").select("*");
    return data || [];
  }
  return JSON.parse(localStorage.getItem("sessions")) || [];
}

export async function getAllInvitations() {
  if (USE_SUPABASE) {
    const { data } = await supabase.from("invitations").select("*");
    return data || [];
  }
  return JSON.parse(localStorage.getItem("invitations")) || [];
}

export function resetMockData() {
  registeredArtists = [];
  invitations = [];
  sessions = [];
  currentUserEmail = "";
  localStorage.removeItem("notifications");
  localStorage.removeItem("currentUserSupabase");
  save();
}
