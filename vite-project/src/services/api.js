// src/services/api.js
// SwarSethu — Mock Local API for Artist Scheduling & Collaboration

// ============================
// Local Database (in localStorage)
// ============================

let registeredArtists =
  JSON.parse(localStorage.getItem("artists")) ||
  [
    { id: "a1", name: "S. Kumar", email: "kumar@mail.com", role: "vocal" },
    { id: "a2", name: "T. Ramesh", email: "ramesh@mail.com", role: "mrudangist" },
    { id: "a3", name: "L. Priya", email: "priya@mail.com", role: "harmonist" },
  ];

let invitations = JSON.parse(localStorage.getItem("invitations")) || [];
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let currentUserEmail = localStorage.getItem("currentUserEmail") || "kumar@mail.com";

// ============================
// Save to localStorage
// ============================
function save() {
  localStorage.setItem("artists", JSON.stringify(registeredArtists));
  localStorage.setItem("invitations", JSON.stringify(invitations));
  localStorage.setItem("sessions", JSON.stringify(sessions));
  localStorage.setItem("currentUserEmail", currentUserEmail);
}

// ============================
// Current User
// ============================
export function getCurrentUser() {
  return registeredArtists.find((a) => a.email === currentUserEmail);
}

// ✅ Updated setCurrentUser with Event Dispatch
export function setCurrentUser(email) {
  currentUserEmail = email;
  save();

  // Dispatch global event so components (Dashboard, Schedule) reload
  try {
    window.dispatchEvent(
      new CustomEvent("swarsethu:userChanged", { detail: { email } })
    );
  } catch (e) {
    const ev = document.createEvent("Event");
    ev.initEvent("swarsethu:userChanged", true, true);
    window.dispatchEvent(ev);
  }
}

// ============================
// Artist Management
// ============================
export async function registerArtist({ name, email, role }) {
  const newArtist = {
    id: `a_${Date.now()}`,
    name,
    email,
    role,
  };
  registeredArtists.push(newArtist);
  setCurrentUser(email);
  save();
  return newArtist;
}

export async function getAllArtists() {
  return new Promise((resolve) => setTimeout(() => resolve([...registeredArtists]), 150));
}

export async function getArtists(role = "", q = "") {
  const filtered = registeredArtists.filter(
    (a) =>
      (!role || a.role === role) &&
      (!q || a.name.toLowerCase().includes(q.toLowerCase()))
  );
  return new Promise((resolve) => setTimeout(() => resolve(filtered), 200));
}

export async function getByRole(role = "") {
  const artistsFiltered = registeredArtists.filter(
    (a) => !role || a.role.toLowerCase() === role.toLowerCase()
  );
  const invitesFiltered = invitations.filter(
    (inv) => !role || inv.role.toLowerCase() === role.toLowerCase()
  );
  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ artists: artistsFiltered, invitations: invitesFiltered }),
      200
    )
  );
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
// Concerts (Predefined Mock List)
// ============================
export async function getConcerts() {
  return [
    {
      id: "c1",
      title: "Ganesh Utsav — Evening Gala",
      description: "Festival concert",
      venue: "Town Hall",
    },
    {
      id: "c2",
      title: "Diwali Celebration — Main Stage",
      description: "Festival special",
      venue: "Main Stage",
    },
    {
      id: "c3",
      title: "Carnatic Fusion Night",
      description: "Cultural fusion concert",
      venue: "Music Academy",
    },
  ];
}

// ============================
// Create Session (Send Invites)
// ============================
export async function createSession(payload) {
  const sender = getCurrentUser();
  if (!sender) throw new Error("No current user found");

  // Validate venue & date/time
  if (!payload.venue || !payload.date_time) {
    throw new Error("Venue and Date/Time are mandatory to schedule a concert.");
  }

  // Check if any invited artist is already busy at that time
  const existingInvites = JSON.parse(localStorage.getItem("invitations")) || [];
  const conflicting = existingInvites.filter(
    (inv) =>
      inv.date_time === payload.date_time &&
      inv.status === "accepted" &&
      payload.invites.some((i) => i.user_id === inv.invited_user_id)
  );
  if (conflicting.length > 0) {
    const busyArtists = conflicting.map((c) => c.invited_user_id).join(", ");
    throw new Error(
      `Cannot send invites. The following artists are already booked for this time: ${busyArtists}`
    );
  }

  // Find concert title if not provided
  let concertTitle = payload.concert_title || null;
  if (!concertTitle && payload.concert_id) {
    const concerts = await getConcerts();
    const found = concerts.find((c) => c.id === payload.concert_id);
    if (found) concertTitle = found.title;
  }
  concertTitle = concertTitle || payload.concert_id || "Untitled Concert";

  // ✅ FIX: store date_time as local (no UTC shift)
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

  // Create invitations
  payload.invites.forEach((inv) => {
    const artist = registeredArtists.find((a) => a.id === inv.user_id);
    const inviteObj = {
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
      // ✅ FIX: ensure same local date
      date_time: toLocalISOString(session.date_time),
      invited_user_name: artist ? artist.name : "Unknown",
    };
    invitations.push(inviteObj);
  });

  save();
  return session;
}

// ============================
// Dashboard Data
// ============================
export async function getDashboard() {
  const user = getCurrentUser();
  if (!user) throw new Error("No current user");

  const myReceived = invitations.filter((i) => i.invited_user_id === user.id);
  const mySent = invitations.filter((i) => i.sent_by === user.email);
  const mySessions = sessions.filter((s) => s.created_by === user.email);

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
export async function respondInvitation(inviteId, status) {
  const idx = invitations.findIndex((i) => i.id === inviteId);
  if (idx === -1) throw new Error("Invitation not found");

  invitations[idx].status = status;
  invitations[idx].responded_at = new Date().toISOString();

  const senderEmail = invitations[idx].sent_by;
  const receiver = getCurrentUser();
  const concertTitle =
    invitations[idx].concert_title || invitations[idx].title || invitations[idx].concert_id;
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
export async function getNotifications(email) {
  const all = JSON.parse(localStorage.getItem("notifications")) || [];
  return all.filter((n) => n.to === email).reverse();
}

export async function clearNotifications(email) {
  const all = JSON.parse(localStorage.getItem("notifications")) || [];
  const filtered = all.filter((n) => n.to !== email);
  localStorage.setItem("notifications", JSON.stringify(filtered));
}

// ============================
// Utility Functions
// ============================
export async function getAllSessions() {
  return JSON.parse(localStorage.getItem("sessions")) || [];
}

export async function getAllInvitations() {
  return JSON.parse(localStorage.getItem("invitations")) || [];
}

export function resetMockData() {
  registeredArtists = [];
  invitations = [];
  sessions = [];
  currentUserEmail = "";
  localStorage.removeItem("notifications");
  save();
}
