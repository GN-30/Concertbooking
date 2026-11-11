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
const DEFAULT_ARTISTS = [
  { id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "vocal", username: "skumar", bio: "Senior Carnatic vocalist renowned for soulful Bhava and intricate ragas.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a2", name: "T. Ramesh", email: "ramesh@mail.com", role: "mrudangist", username: "tramesh", bio: "Veteran Mridangam maestro with 25+ years accompanying stalwarts.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a3", name: "L. Priya", email: "priya@mail.com", role: "harmonist", username: "lpriya", bio: "Versatile Harmonium soloist & accompanist specializing in Bhajans & Katcheri.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a4", name: "Ustad Zakir Ahmed", email: "zakir@mail.com", role: "tabla", username: "zakir", bio: "Hindustani Tabla virtuoso celebrated for lightning-fast tihais and crisp bols.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a5", name: "Vidushi Gayatri V.", email: "gayatri@mail.com", role: "veena", username: "gayatri", bio: "Saraswati Veena maestro evoking pure classical divinity and microtonal shrutis.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
  { id: "a6", name: "Pandit Rakesh Venu", email: "rakesh@mail.com", role: "flutist", username: "rakesh", bio: "Master of the bamboo flute crafting spiritual alapanas and resonant gamakas.", calendar_visibility: "public", calendar_allowed_users: [], calendar_hidden_users: [] },
];

let rawStoredArtists = JSON.parse(localStorage.getItem("artists") || "null");
let registeredArtists = rawStoredArtists && rawStoredArtists.length > 0
  ? rawStoredArtists.map((a) => ({
      ...a,
      calendar_visibility: a.calendar_visibility || "public",
      calendar_allowed_users: Array.isArray(a.calendar_allowed_users) ? a.calendar_allowed_users : [],
      calendar_hidden_users: Array.isArray(a.calendar_hidden_users) ? a.calendar_hidden_users : [],
    }))
  : DEFAULT_ARTISTS;

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
// Persistent Calendar Privacy Map
// ============================
export function getPrivacyMap() {
  try {
    return JSON.parse(localStorage.getItem("calendar_privacy_map") || "{}");
  } catch {
    return {};
  }
}

export function savePrivacyForArtist(artistKey, settings = {}) {
  if (!artistKey) return;
  const map = getPrivacyMap();

  const visibility =
    settings.visibility ||
    settings.calendar_visibility ||
    "public";

  const allowedUsers = Array.isArray(settings.allowedUsers)
    ? settings.allowedUsers
    : Array.isArray(settings.calendar_allowed_users)
    ? settings.calendar_allowed_users
    : [];

  const hiddenUsers = Array.isArray(settings.hiddenUsers)
    ? settings.hiddenUsers
    : Array.isArray(settings.calendar_hidden_users)
    ? settings.calendar_hidden_users
    : [];

  const entry = {
    visibility,
    calendar_visibility: visibility,
    allowedUsers,
    calendar_allowed_users: allowedUsers,
    hiddenUsers,
    calendar_hidden_users: hiddenUsers,
  };

  const strKey = String(artistKey).trim();
  if (strKey) {
    map[strKey] = entry;
    map[strKey.toLowerCase()] = entry;
  }
  localStorage.setItem("calendar_privacy_map", JSON.stringify(map));

  // Sync directly into localStorage "artists" array so any local lookup gets the updated privacy
  try {
    const raw = JSON.parse(localStorage.getItem("artists") || "null");
    if (Array.isArray(raw)) {
      const k = strKey.toLowerCase();
      const updated = raw.map((a) => {
        if (
          String(a.id || "").toLowerCase() === k ||
          String(a.email || "").toLowerCase() === k ||
          String(a.username || "").toLowerCase() === k ||
          String(a.name || "").toLowerCase() === k
        ) {
          return {
            ...a,
            visibility: entry.visibility,
            calendar_visibility: entry.visibility,
            allowedUsers: entry.allowedUsers,
            calendar_allowed_users: entry.allowedUsers,
            hiddenUsers: entry.hiddenUsers,
            calendar_hidden_users: entry.hiddenUsers,
          };
        }
        return a;
      });
      localStorage.setItem("artists", JSON.stringify(updated));
      registeredArtists = updated;
    }
  } catch (e) {}

  return entry;
}

export function applyPrivacyToArtist(artist) {
  if (!artist) return artist;
  const map = getPrivacyMap();
  const idKey = artist.id ? map[String(artist.id)] || map[String(artist.id).toLowerCase()] : null;
  const emailKey = artist.email ? map[String(artist.email)] || map[String(artist.email).toLowerCase()] : null;
  const usernameKey = artist.username ? map[String(artist.username)] || map[String(artist.username).toLowerCase()] : null;
  const nameKey = artist.name ? map[String(artist.name)] || map[String(artist.name).toLowerCase()] : null;
  const p = idKey || emailKey || usernameKey || nameKey;

  const mode = p?.visibility || p?.calendar_visibility || artist.calendar_visibility || artist.visibility || "public";
  const allowed = p?.allowedUsers || p?.calendar_allowed_users || artist.calendar_allowed_users || artist.allowedUsers || [];
  const hidden = p?.hiddenUsers || p?.calendar_hidden_users || artist.calendar_hidden_users || artist.hiddenUsers || [];

  return {
    ...artist,
    visibility: mode,
    calendar_visibility: mode,
    allowedUsers: allowed,
    calendar_allowed_users: allowed,
    hiddenUsers: hidden,
    calendar_hidden_users: hidden,
  };
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
  const activeEmailOrId = (localStorage.getItem("currentUserEmail") || currentUserEmail || "").trim().toLowerCase();
  if (!activeEmailOrId) return null;

  // 1. Check if currentUserSupabase matches the active logged-in email or ID or username or name
  const u = JSON.parse(localStorage.getItem("currentUserSupabase") || "null");
  if (
    u &&
    (String(u.email || "").toLowerCase() === activeEmailOrId ||
      String(u.id || "").toLowerCase() === activeEmailOrId ||
      String(u.username || "").toLowerCase() === activeEmailOrId ||
      String(u.name || "").toLowerCase() === activeEmailOrId)
  ) {
    return applyPrivacyToArtist(u);
  }

  // 2. Freshly look up in registered artists
  const raw = JSON.parse(localStorage.getItem("artists") || "null");
  const list = raw && raw.length > 0 ? raw : registeredArtists;
  const found = list.find(
    (a) =>
      String(a.email || "").toLowerCase() === activeEmailOrId ||
      String(a.id || "").toLowerCase() === activeEmailOrId ||
      String(a.username || "").toLowerCase() === activeEmailOrId ||
      String(a.name || "").toLowerCase() === activeEmailOrId
  );
  if (found) {
    return applyPrivacyToArtist(found);
  }

  // 3. If u is present at all, return it decorated
  if (u) {
    return applyPrivacyToArtist(u);
  }

  // 4. Fallback
  return applyPrivacyToArtist(list[0] || DEFAULT_ARTISTS[0]);
}

export function setCurrentUser(emailOrId) {
  const val = (emailOrId || "").trim();
  currentUserEmail = val;
  localStorage.setItem("currentUserEmail", val);

  if (!val) {
    localStorage.removeItem("currentUserSupabase");
    save();
    return;
  }

  const raw = JSON.parse(localStorage.getItem("artists") || "null");
  const list = raw && raw.length > 0 ? raw : registeredArtists;
  const found = list.find(
    (a) =>
      String(a.email || "").toLowerCase() === val.toLowerCase() ||
      String(a.id || "").toLowerCase() === val.toLowerCase() ||
      String(a.username || "").toLowerCase() === val.toLowerCase() ||
      String(a.name || "").toLowerCase() === val.toLowerCase()
  );

  if (found) {
    localStorage.setItem("currentUserSupabase", JSON.stringify(applyPrivacyToArtist(found)));
  } else {
    // Check if existing currentUserSupabase matches this identifier; if so, keep it!
    const existing = JSON.parse(localStorage.getItem("currentUserSupabase") || "null");
    if (
      existing &&
      (String(existing.email || "").toLowerCase() === val.toLowerCase() ||
        String(existing.id || "").toLowerCase() === val.toLowerCase() ||
        String(existing.username || "").toLowerCase() === val.toLowerCase() ||
        String(existing.name || "").toLowerCase() === val.toLowerCase())
    ) {
      localStorage.setItem("currentUserSupabase", JSON.stringify(applyPrivacyToArtist(existing)));
    } else {
      // Do not wipe out; preserve user with updated ID/email
      const partialUser = { id: val, email: val, name: val, role: "Classical Artist" };
      localStorage.setItem("currentUserSupabase", JSON.stringify(applyPrivacyToArtist(partialUser)));
    }
  }

  save();
  try {
    window.dispatchEvent(new CustomEvent("swarsethu:userChanged", { detail: { email: val } }));
  } catch (e) {
    const ev = document.createEvent("Event");
    ev.initEvent("swarsethu:userChanged", true, true);
    window.dispatchEvent(ev);
  }
}

export function setCurrentUserObj(userObj) {
  if (!userObj) {
    setCurrentUser("");
    return;
  }
  const decorated = applyPrivacyToArtist(userObj);
  localStorage.setItem("currentUserSupabase", JSON.stringify(decorated));
  currentUserEmail = decorated.email || decorated.id || decorated.username || decorated.name || "";
  localStorage.setItem("currentUserEmail", currentUserEmail);

  // Sync to local artists list
  try {
    const raw = JSON.parse(localStorage.getItem("artists") || "null");
    const list = Array.isArray(raw) && raw.length > 0 ? raw : registeredArtists;
    const idx = list.findIndex(
      (a) =>
        (decorated.id && String(a.id || "").toLowerCase() === String(decorated.id).toLowerCase()) ||
        (decorated.email && String(a.email || "").toLowerCase() === String(decorated.email).toLowerCase()) ||
        (decorated.username && String(a.username || "").toLowerCase() === String(decorated.username).toLowerCase()) ||
        (decorated.name && String(a.name || "").toLowerCase() === String(decorated.name).toLowerCase())
    );
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...decorated };
    } else {
      list.push(decorated);
    }
    localStorage.setItem("artists", JSON.stringify(list));
    registeredArtists = list;
  } catch (e) {}

  save();
  try {
    window.dispatchEvent(new CustomEvent("swarsethu:userChanged", { detail: { email: currentUserEmail, user: decorated } }));
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
  let list = [];
  if (USE_BACKEND) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/artists`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          list = json;
        }
      }
    } catch (e) {
      console.warn("Backend unavailable, falling back:", e.message);
    }
  }

  if (list.length === 0 && USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        list = data;
      }
    } catch (e) {
      console.warn("Supabase getAllArtists failed, falling back to local:", e.message);
    }
  }

  if (list.length === 0) {
    const rawStored = JSON.parse(localStorage.getItem("artists") || "null");
    list = rawStored && rawStored.length > 0 ? rawStored : registeredArtists;
  }

  // Always keep localStorage "artists" cache refreshed so local queries have full data
  if (Array.isArray(list) && list.length > 0) {
    try {
      localStorage.setItem("artists", JSON.stringify(list));
      registeredArtists = list;
    } catch (e) {}
  }

  return list.map(applyPrivacyToArtist);
}

// ============================
// Calendar Privacy & Visibility
// ============================

/**
 * Checks whether the viewer is permitted to see the target artist's calendar.
 * Returns { allowed: boolean, mode: string, reason?: string, isSelf?: boolean }
 */
export function checkCalendarAccess(targetArtistInput, viewerInput) {
  if (!targetArtistInput) return { allowed: true, mode: "public" };

  const targetArtist = applyPrivacyToArtist(targetArtistInput);
  const viewer = viewerInput ? applyPrivacyToArtist(viewerInput) : null;

  const viewerId = viewer?.id ? String(viewer.id).toLowerCase().trim() : "";
  const viewerEmail = viewer?.email ? viewer.email.toLowerCase().trim() : "";
  const viewerUsername = viewer?.username ? viewer.username.toLowerCase().trim() : "";
  const viewerName = viewer?.name ? viewer.name.toLowerCase().trim() : "";

  const targetId = targetArtist?.id ? String(targetArtist.id).toLowerCase().trim() : "";
  const targetEmail = targetArtist?.email ? targetArtist.email.toLowerCase().trim() : "";
  const targetUsername = targetArtist?.username ? targetArtist.username.toLowerCase().trim() : "";
  const targetName = targetArtist?.name ? targetArtist.name.toLowerCase().trim() : "";

  // Viewing own calendar (or special self identifier "me")
  const isSelf = Boolean(
    targetId === "me" ||
      (viewer &&
        ((viewerId && targetId && viewerId === targetId) ||
          (viewerEmail && targetEmail && viewerEmail === targetEmail) ||
          (viewerUsername && targetUsername && viewerUsername === targetUsername) ||
          (viewerName && targetName && viewerName === targetName)))
  );

  if (isSelf) {
    return {
      allowed: true,
      mode: targetArtist.calendar_visibility || "public",
      isSelf: true,
    };
  }

  const mode = targetArtist.calendar_visibility || "public";
  const allowed = Array.isArray(targetArtist.calendar_allowed_users)
    ? targetArtist.calendar_allowed_users.map((u) => String(u).toLowerCase().trim())
    : [];
  const hidden = Array.isArray(targetArtist.calendar_hidden_users)
    ? targetArtist.calendar_hidden_users.map((u) => String(u).toLowerCase().trim())
    : [];

  if (mode === "private") {
    return {
      allowed: false,
      mode: "private",
      reason: `${targetArtist.name || "This artist"} has set their concert schedule to private mode (Only Me). Detailed bookings and availability are hidden.`,
    };
  }

  if (mode === "whitelist") {
    const isAllowed = allowed.some(
      (u) =>
        (viewerId && u === viewerId) ||
        (viewerEmail && u === viewerEmail) ||
        (viewerUsername && u === viewerUsername) ||
        (viewerName && u === viewerName)
    );
    if (!isAllowed) {
      return {
        allowed: false,
        mode: "whitelist",
        reason: `${targetArtist.name || "This artist"} has restricted their calendar to selected collaborators only.`,
      };
    }
    return { allowed: true, mode: "whitelist" };
  }

  if (mode === "blacklist") {
    const isBlocked = hidden.some(
      (u) =>
        (viewerId && u === viewerId) ||
        (viewerEmail && u === viewerEmail) ||
        (viewerUsername && u === viewerUsername) ||
        (viewerName && u === viewerName)
    );
    if (isBlocked) {
      return {
        allowed: false,
        mode: "blacklist",
        reason: `${targetArtist.name || "This artist"} has restricted your account from viewing their calendar.`,
      };
    }
    return { allowed: true, mode: "blacklist" };
  }

  return { allowed: true, mode: "public" };
}

export async function updateArtistById(id, updates = {}) {
  // Always update registeredArtists locally
  const rawStored = JSON.parse(localStorage.getItem("artists") || "null");
  const list = rawStored && rawStored.length > 0 ? rawStored : registeredArtists;
  const strId = String(id || "").toLowerCase().trim();
  const idx = list.findIndex(
    (a) =>
      String(a.id || "").toLowerCase().trim() === strId ||
      String(a.email || "").toLowerCase().trim() === strId ||
      String(a.username || "").toLowerCase().trim() === strId ||
      String(a.name || "").toLowerCase().trim() === strId
  );
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    registeredArtists = list;
    save();
  }

  if (USE_BACKEND) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/artists/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn("Backend updateArtistById failed, using local/supabase fallback:", e.message);
    }
  }

  if (USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from("artists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase updateArtistById fallback:", e.message);
    }
  }

  if (idx !== -1) {
    return list[idx];
  }

  const current = getCurrentUser();
  if (current && (current.id === id || current.email === id || current.name === id)) {
    const updated = { ...current, ...updates };
    registeredArtists.push(updated);
    save();
    return updated;
  }
  return null;
}

export async function updateCalendarPrivacy(userOrId, settings = {}) {
  const visibility =
    settings.visibility ||
    settings.calendar_visibility ||
    "public";

  const allowedUsers = Array.isArray(settings.allowedUsers)
    ? settings.allowedUsers
    : Array.isArray(settings.calendar_allowed_users)
    ? settings.calendar_allowed_users
    : [];

  const hiddenUsers = Array.isArray(settings.hiddenUsers)
    ? settings.hiddenUsers
    : Array.isArray(settings.calendar_hidden_users)
    ? settings.calendar_hidden_users
    : [];

  const updates = {
    visibility,
    calendar_visibility: visibility,
    allowedUsers,
    calendar_allowed_users: allowedUsers,
    hiddenUsers,
    calendar_hidden_users: hiddenUsers,
  };

  const current = getCurrentUser();
  const targetObj = typeof userOrId === "object" && userOrId !== null ? userOrId : current;
  const targetId = typeof userOrId === "string" ? userOrId : (targetObj?.id || targetObj?.email || targetObj?.name);

  // 1. Immediately persist under all key combinations in privacy map
  const keysToSave = new Set();
  if (targetId) keysToSave.add(String(targetId));
  if (targetObj) {
    if (targetObj.id) keysToSave.add(String(targetObj.id));
    if (targetObj.email) keysToSave.add(String(targetObj.email));
    if (targetObj.username) keysToSave.add(String(targetObj.username));
    if (targetObj.name) keysToSave.add(String(targetObj.name));
  }
  if (current) {
    if (current.id) keysToSave.add(String(current.id));
    if (current.email) keysToSave.add(String(current.email));
    if (current.username) keysToSave.add(String(current.username));
    if (current.name) keysToSave.add(String(current.name));
  }

  keysToSave.forEach((k) => {
    savePrivacyForArtist(k, updates);
  });

  // 2. Update local cached list
  try {
    const rawStored = JSON.parse(localStorage.getItem("artists") || "null");
    const list = rawStored && rawStored.length > 0 ? rawStored : registeredArtists;
    const updatedList = list.map((a) => {
      const match =
        keysToSave.has(String(a.id || "")) ||
        keysToSave.has(String(a.email || "")) ||
        keysToSave.has(String(a.username || "")) ||
        keysToSave.has(String(a.name || ""));
      return match ? { ...a, ...updates } : a;
    });
    registeredArtists = updatedList;
    localStorage.setItem("artists", JSON.stringify(updatedList));
  } catch (e) {}

  // 3. Update artist in storage / backend
  const updated = targetId ? await updateArtistById(targetId, updates) : null;

  // 4. Sync current user if updating self
  if (current) {
    const isSelfMatch =
      keysToSave.has(String(current.id || "")) ||
      keysToSave.has(String(current.email || "")) ||
      keysToSave.has(String(current.username || "")) ||
      keysToSave.has(String(current.name || ""));
    if (isSelfMatch) {
      const newObj = { ...current, ...updates };
      setCurrentUserObj(newObj);
    }
  }

  save();
  return { ...targetObj, ...updates, ...updated };
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
    try {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .or(`email.eq.${loginId},username.eq.${loginId}`)
        .maybeSingle();

      if (!error && data) {
        if (password && data.password && data.password !== password) {
          throw new Error("Incorrect password. Please try again.");
        }
        setCurrentUserObj(data);
        return data;
      }
    } catch (e) {
      if (e.message && e.message.includes("Incorrect password")) throw e;
      console.warn("Supabase login direct failed, trying local fallback:", e.message);
    }
  }

  // 3. LocalStorage fallback
  const raw = JSON.parse(localStorage.getItem("artists") || "null");
  const list = raw && raw.length > 0 ? raw : registeredArtists;
  const artist = list.find(
    (a) =>
      (a.email?.toLowerCase() === loginId.toLowerCase() ||
        a.username?.toLowerCase() === loginId.toLowerCase() ||
        String(a.id).toLowerCase() === loginId.toLowerCase()) &&
      (!a.password || !password || a.password === password)
  );
  if (!artist) throw new Error("No artist account found with these credentials.");
  setCurrentUserObj(artist);
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
export async function getDashboard(targetArtistOrId = null, viewer = null) {
  const activeViewer = viewer || getCurrentUser();

  // 1. Check if viewing all ensemble overview
  if (targetArtistOrId === "all") {
    const viewerParam = activeViewer
      ? `&viewer_id=${encodeURIComponent(activeViewer.id || "")}&viewer_email=${encodeURIComponent(activeViewer.email || "")}&viewer_username=${encodeURIComponent(activeViewer.username || "")}&viewer_name=${encodeURIComponent(activeViewer.name || "")}`
      : "";

    if (USE_BACKEND) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dashboard?all=true${viewerParam}`);
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
    user = applyPrivacyToArtist(targetArtistOrId);
  } else if (typeof targetArtistOrId === "string" && targetArtistOrId && targetArtistOrId !== "me") {
    const all = await getAllArtists();
    const found = all.find(
      (a) =>
        String(a.id).toLowerCase() === String(targetArtistOrId).toLowerCase() ||
        a.email?.toLowerCase() === String(targetArtistOrId).toLowerCase() ||
        a.username?.toLowerCase() === String(targetArtistOrId).toLowerCase()
    );
    if (found) {
      user = applyPrivacyToArtist(found);
    } else if (USE_SUPABASE) {
      try {
        const { data } = await supabase
          .from("artists")
          .select("*")
          .or(`id.eq.${targetArtistOrId},email.eq.${targetArtistOrId},username.eq.${targetArtistOrId}`)
          .maybeSingle();
        if (data) user = applyPrivacyToArtist(data);
      } catch (e) {}
    }
  }

  if (!user) {
    user = getCurrentUser();
  }
  if (!user) {
    user = applyPrivacyToArtist({ id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "Vocalist" });
  } else {
    user = applyPrivacyToArtist(user);
  }

  // Check Calendar Privacy for this viewer
  const access = checkCalendarAccess(user, activeViewer);
  if (!access.allowed) {
    return {
      currentUser: user,
      isCalendarHidden: true,
      visibilityNotice: access.reason || `${user.name || "This artist"} has restricted their calendar visibility.`,
      myConcerts: [],
      sentInvitations: [],
      invitations: [],
    };
  }

  // 3. Try Backend API
  if (USE_BACKEND) {
    try {
      const queryParam = user.id ? `id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email || "")}` : `email=${encodeURIComponent(user.email || "")}`;
      const viewerParam = activeViewer
        ? `&viewer_id=${encodeURIComponent(activeViewer.id || "")}&viewer_email=${encodeURIComponent(activeViewer.email || "")}&viewer_username=${encodeURIComponent(activeViewer.username || "")}&viewer_name=${encodeURIComponent(activeViewer.name || "")}`
        : "";
      const res = await fetch(`${BACKEND_URL}/api/dashboard?${queryParam}${viewerParam}`);
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
