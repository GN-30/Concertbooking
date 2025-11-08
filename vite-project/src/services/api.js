// src/services/api.js
// Local mock API with persistent data in localStorage
/* ===========================================
   LOCAL MOCK DATABASE INITIALIZATION
=========================================== */
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

/* ===========================================
   SAVE TO LOCALSTORAGE
=========================================== */
function save() {
  localStorage.setItem("artists", JSON.stringify(registeredArtists));
  localStorage.setItem("invitations", JSON.stringify(invitations));
  localStorage.setItem("sessions", JSON.stringify(sessions));
  localStorage.setItem("currentUserEmail", currentUserEmail);
}

/* ===========================================
   USER CONTEXT HELPERS
=========================================== */
export function getCurrentUser() {
  return registeredArtists.find((a) => a.email === currentUserEmail);
}

export function setCurrentUser(email) {
  currentUserEmail = email;
  save();
}

/* ===========================================
   1. REGISTER ARTIST
=========================================== */
export async function registerArtist({ name, email, role }) {
  const newArtist = {
    id: `a_${Date.now()}`,
    name,
    email,
    role,
  };
  registeredArtists.push(newArtist);
  setCurrentUser(email); // auto-login after registration
  save();
  return newArtist;
}

/* ===========================================
   2. GET ARTISTS (filter / search)
=========================================== */
export async function getArtists(role = "", q = "") {
  const filtered = registeredArtists.filter(
    (a) =>
      (!role || a.role === role) &&
      (!q || a.name.toLowerCase().includes(q.toLowerCase()))
  );
  return new Promise((resolve) => setTimeout(() => resolve(filtered), 200));
}

/* ===========================================
   3. GET ALL REGISTERED ARTISTS
=========================================== */
export async function getAllArtists() {
  return new Promise((resolve) =>
    setTimeout(() => resolve([...registeredArtists]), 200)
  );
}

/* ===========================================
   4. GET ARTISTS / INVITES BY ROLE
=========================================== */
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

/* ===========================================
   5. GET CONCERTS (mock)
=========================================== */
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
  ];
}

/* ===========================================
   6. CREATE SESSION (Send invites)
   - stores sender email/name/role on each invite
   - accepts payload.concert_title or looks up by id
=========================================== */
export async function createSession(payload) {
  const sender = getCurrentUser();
  if (!sender) {
    const fallbackEmail =
      localStorage.getItem("currentUserEmail") || "unknown@mail.com";
    throw new Error(`No current user found for email: ${fallbackEmail}`);
  }

  // determine concert title (prefer payload.concert_title, else lookup)
  let concertTitle = payload.concert_title || null;
  if (!concertTitle && payload.concert_id) {
    const concerts = await getConcerts();
    const found = concerts.find((c) => c.id === payload.concert_id);
    if (found) concertTitle = found.title;
  }
  concertTitle = concertTitle || payload.concert_id || "Untitled Concert";

  const session = {
    id: `s_${Date.now()}`,
    concert_id: payload.concert_id,
    concert_title: concertTitle,
    date_time: payload.date_time || null,
    venue: payload.venue || null,
    invites: payload.invites || [],
    created_by: sender.email,
    created_at: new Date().toISOString(),
  };
  sessions.push(session);

  payload.invites.forEach((inv) => {
    const inviteObj = {
      id: `i_${Date.now()}_${inv.user_id}`,
      session_id: session.id,
      invited_user_id: inv.user_id,
      status: "pending",
      priority: inv.priority,
      role: inv.role,
      concert_id: payload.concert_id,
      title: payload.concert_title
        ? `Invitation: ${payload.concert_title}`
        : `Invitation: ${concertTitle}`,
      sent_by: sender.email,
      sent_by_name: sender.name || sender.email.split("@")[0],
      sent_by_role: sender.role || "Unknown",
      created_at: new Date().toISOString(),
      venue: session.venue || null,
      concert_title: session.concert_title,
    };
    invitations.push(inviteObj);
  });

  save();
  return session;
}

/* ===========================================
   7. GET DASHBOARD (for current artist)
=========================================== */
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

/* ===========================================
   8. RESPOND TO INVITATION (Accept/Decline)
   - creates notification for sender with context
=========================================== */
export async function respondInvitation(inviteId, status) {
  const idx = invitations.findIndex((i) => i.id === inviteId);
  if (idx === -1) throw new Error("Invitation not found");

  invitations[idx].status = status;
  invitations[idx].responded_at = new Date().toISOString();

  // create notification for sender
  const senderEmail = invitations[idx].sent_by;
  const receiver = getCurrentUser();
  const concertTitle =
    invitations[idx].concert_title || invitations[idx].title || invitations[idx].concert_id;
  const venue = invitations[idx].venue || "";

  const note = {
    id: `n_${Date.now()}`,
    to: senderEmail,
    message: `${receiver.name} (${receiver.role}) has ${status} the invitation for "${concertTitle}"${venue ? ` at ${venue}` : ""}`,
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

/* ===========================================
   9. GET NOTIFICATIONS (for sender)
=========================================== */
export async function getNotifications(email) {
  const all = JSON.parse(localStorage.getItem("notifications")) || [];
  return all.filter((n) => n.to === email).reverse();
}

/* ===========================================
   10. CLEAR NOTIFICATIONS
=========================================== */
export async function clearNotifications(email) {
  const all = JSON.parse(localStorage.getItem("notifications")) || [];
  const filtered = all.filter((n) => n.to !== email);
  localStorage.setItem("notifications", JSON.stringify(filtered));
}

/* ===========================================
   11. RESET MOCK DATA
=========================================== */
export function resetMockData() {
  registeredArtists = [];
  invitations = [];
  sessions = [];
  currentUserEmail = "";
  localStorage.removeItem("notifications");
  save();
}
