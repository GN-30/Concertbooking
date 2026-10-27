// src/pages/DashBoard.jsx
// Royal Indian Classical Concert & Sabha Command Center
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import {
  getDashboard,
  respondInvitation,
  getNotifications,
  getAllArtists,
  getCurrentUser,
} from "../services/api";
import MusicVisualizer3D from "../components/MusicVisualizer3D";
import FloatingNotes from "../components/FloatingNotes";

// Indian classical instrument mapping
const ROLE_BADGES = {
  vocal: { icon: "🎤", label: "Vocal (Pradhana)" },
  mrudangist: { icon: "🥁", label: "Mridangist" },
  harmonist: { icon: "🎹", label: "Harmonist" },
  violinist: { icon: "🎻", label: "Violinist" },
  flutist: { icon: "🪈", label: "Venu Flutist" },
  tabla: { icon: "🪘", label: "Tabla Maestro" },
  veena: { icon: "🪕", label: "Veena / Sitarist" },
};

function formatDate(dt) {
  if (!dt) return "N/A";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Returns YYYY-MM-DD using LOCAL timezone —
 * strictly eliminates the "clicking 19th shows 18th" UTC offset bug!
 */
function toLocalDateString(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const INDIAN_DAYS = [
  { en: "Sun", sa: "रवि" },
  { en: "Mon", sa: "सोम" },
  { en: "Tue", sa: "मंगल" },
  { en: "Wed", sa: "बुध" },
  { en: "Thu", sa: "गुरु" },
  { en: "Fri", sa: "शुक्र" },
  { en: "Sat", sa: "शनि" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(() => getCurrentUser());
  const [data, setData] = useState({
    currentUser: {},
    myConcerts: [],
    invitations: [],
    sentInvitations: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [artists, setArtists] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState("me");

  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Selected date in local timezone YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(today));
  const [activeTab, setActiveTab] = useState("received");

  const headerRef = useRef(null);
  const calRef = useRef(null);

  const loadDashboardData = useCallback(async (targetId = selectedArtistId) => {
    try {
      const res = await getDashboard(targetId);
      setData(res);
      if (targetId === "all") {
        const notes = await getNotifications("all");
        setNotifications(notes);
      } else {
        const emailOrId = res.currentUser?.email || res.currentUser?.id;
        const notes = await getNotifications(emailOrId);
        setNotifications(notes);
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  }, [selectedArtistId]);

  useEffect(() => {
    const user = getCurrentUser();
    setLoggedInUser(user);
    loadDashboardData("me");
    getAllArtists().then(setArtists);
    setMounted(true);

    function onUserChanged() {
      const u = getCurrentUser();
      setLoggedInUser(u);
      loadDashboardData(selectedArtistId);
    }
    window.addEventListener("swarsethu:userChanged", onUserChanged);
    return () => window.removeEventListener("swarsethu:userChanged", onUserChanged);
  }, [loadDashboardData, selectedArtistId]);

  // Handle switching artist schedule from dropdown WITHOUT switching logged-in account
  const handleArtistChange = async (artistId) => {
    setSelectedArtistId(artistId);

    if (artistId === "all") {
      await loadDashboardData("all");
      return;
    }

    if (artistId === "me") {
      const me = getCurrentUser();
      await loadDashboardData(me?.id || "me");
      return;
    }

    // Inspect that artist's schedule only (does NOT switch your logged in user session!)
    await loadDashboardData(artistId);
  };

  // Entrance animations
  useEffect(() => {
    if (!mounted) return;
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -25 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }
  }, [mounted]);

  // Read all accepted events and sessions for the viewed artist or ensemble
  const events = useMemo(() => {
    const sessionMap = {};
    const artistMap = {};
    artists.forEach((a) => (artistMap[a.id] = a));

    // 1. Sessions created by this artist (or all sessions if "all")
    const sessionEvents = (data.myConcerts || []).map((s) => {
      sessionMap[s.id] = s;
      const rawDate = s.date_time;
      return {
        id: `sess_${s.id}`,
        day: rawDate ? toLocalDateString(new Date(rawDate)) : null,
        title: s.concert_title || s.title || "Classical Concert",
        venue: s.venue || "Sabha Auditorium",
        time: formatDate(rawDate),
        artistName: data.currentUser?.name || "Sabha Organizer",
        artistId: s.created_by || data.currentUser?.id,
        roleIcon: "🪕",
        roleLabel: data.currentUser?.role || "Main Troupe",
        sentBy: "Organizer",
        sentById: s.created_by,
      };
    });

    // 2. Accepted received invitations for this artist
    const inviteEvents = (data.invitations || [])
      .filter((inv) => inv.status === "accepted")
      .map((inv) => {
        const session =
          sessionMap[inv.session_id] ||
          (inv.sessions && !Array.isArray(inv.sessions) ? inv.sessions : {}) ||
          {};
        const artist = artistMap[inv.invited_user_id] || {};
        const rawDate = inv.date_time || session.date_time;
        const roleKey = (inv.role || artist.role || "vocal").toLowerCase();
        const roleInfo = ROLE_BADGES[roleKey] || { icon: "🎵", label: inv.role || "Artist" };

        return {
          id: `inv_${inv.id}`,
          day: rawDate ? toLocalDateString(new Date(rawDate)) : null,
          title: inv.concert_title || session.concert_title || inv.title || "Classical Concert",
          venue: inv.venue || session.venue || "TBD",
          time: formatDate(rawDate),
          artistName: artist.name || inv.invited_user_name || inv.invited_user_id || "Maestro",
          artistId: inv.invited_user_id,
          roleIcon: roleInfo.icon,
          roleLabel: roleInfo.label,
          sentBy: inv.sent_by_name || inv.sent_by,
          sentById: inv.sent_by,
        };
      });

    // 3. Accepted dispatched invitations for this artist
    const dispatchedEvents = (data.sentInvitations || [])
      .filter((inv) => inv.status === "accepted")
      .map((inv) => {
        const rawDate = inv.date_time;
        const roleKey = (inv.role || "vocal").toLowerCase();
        const roleInfo = ROLE_BADGES[roleKey] || { icon: "🎵", label: inv.role || "Artist" };
        return {
          id: `sent_${inv.id}`,
          day: rawDate ? toLocalDateString(new Date(rawDate)) : null,
          title: inv.concert_title || inv.title || "Classical Concert",
          venue: inv.venue || "TBD",
          time: formatDate(rawDate),
          artistName: inv.invited_user_name || inv.invited_user_id || "Maestro",
          artistId: inv.invited_user_id,
          roleIcon: roleInfo.icon,
          roleLabel: roleInfo.label,
          sentBy: inv.sent_by_name || inv.sent_by,
          sentById: inv.sent_by,
        };
      });

    const all = [...sessionEvents, ...inviteEvents, ...dispatchedEvents];
    const seen = new Set();
    return all.filter((ev) => {
      if (!ev.day) return false;
      const key = `${ev.day}_${ev.title}_${ev.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, artists]);

  function eventsForDate(date) {
    return events.filter((e) => e.day === date);
  }

  // Calendar calculations
  const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const daysInMonth = end.getDate();
  const firstDay = start.getDay();
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

  const handleResponse = async (id, status) => {
    await respondInvitation(id, status, loggedInUser);
    await loadDashboardData(selectedArtistId);
  };

  const pendingCount = (loggedInUser?.email
    ? data.invitations.filter((i) => i.status === "pending")
    : []
  ).length;

  const isInspectingOther = selectedArtistId !== "me" && selectedArtistId !== "all";
  const inspectedArtist = isInspectingOther
    ? artists.find((a) => a.id === selectedArtistId) || data.currentUser
    : null;

  const selectedDateEvents = eventsForDate(selectedDate);
  const isSelectedDateBusy = selectedDateEvents.length > 0;

  return (
    <div className="page-wrapper">
      <div className="orb-gold" style={{ width: 600, height: 600, top: 0, left: '10%' }} />
      <div className="orb-violet" style={{ width: 500, height: 500, bottom: '20%', right: '5%' }} />

      <FloatingNotes count={14} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Bar */}
        <div ref={headerRef} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div>
              <div className="badge-pill mb-4">✦ Sangeeta Sabha Command ✦</div>
              <h1
                className="font-black tracking-tight"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 45%, #c084fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Concert Dashboard
              </h1>
              <p className="text-purple-300/65 text-sm mt-2">
                Live Troupe Schedule · Artist Availability · Sabha Invitations
              </p>
            </div>

            {/* Logged-In User Profile + Availability Checker Dropdown */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-3xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.09] shadow-xl">
              {/* Logged in Maestro (Never changes when checking others) */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-amber-200 border border-amber-400/40 text-base shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #d97706, #7c3aed)",
                  }}
                >
                  {loggedInUser?.name?.[0] || "M"}
                </div>
                <div>
                  <div className="text-xs text-amber-400/80 font-bold uppercase tracking-wider">
                    Logged In
                  </div>
                  <div className="text-sm font-bold text-white">
                    {loggedInUser?.name || "Maestro"}
                  </div>
                  <div className="text-[11px] font-semibold text-purple-300/80 capitalize">
                    {loggedInUser?.role || "Classical Artist"}
                  </div>
                </div>

                {pendingCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse ml-1">
                    {pendingCount} Pending
                  </span>
                )}
              </div>

              {/* Dynamic Availability Checker Dropdown */}
              <div className="sm:border-l sm:border-white/10 sm:pl-3 w-full sm:w-auto flex flex-col gap-1">
                <label className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <span>📅</span> Check Artist Availability:
                </label>
                <select
                  value={selectedArtistId}
                  onChange={(e) => handleArtistChange(e.target.value)}
                  className="text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer text-amber-200 transition-all shadow-md w-full sm:w-auto"
                  style={{
                    background: "linear-gradient(135deg, #1b0a33 0%, #0d041c 100%)",
                    border: "1px solid rgba(251,191,36,0.4)",
                  }}
                >
                  <option value="me">👤 My Schedule ({loggedInUser?.name || "Logged In"})</option>
                  <option value="all">🌐 All Ensemble Schedule</option>
                  <optgroup label="── Check Specific Artist Availability ──">
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        🔍 Check: {a.name} ({a.role})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Artist Availability Inspector Banner ── */}
        {isInspectingOther && (
          <div
            className="mb-8 p-5 rounded-3xl backdrop-blur-2xl animate-fadeIn"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(147,51,234,0.18))",
              border: "1px solid rgba(251,191,36,0.35)",
              boxShadow: "0 15px 35px rgba(0,0,0,0.4), 0 0 25px rgba(245,158,11,0.1)",
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br from-amber-400 to-purple-600 border border-amber-300/40 shadow-md">
                  {ROLE_BADGES[(inspectedArtist?.role || "").toLowerCase()]?.icon || "🪕"}
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <span>🔍</span> Availability Inspector Mode
                  </div>
                  <div className="text-lg font-black text-white">
                    {inspectedArtist?.name} · <span className="text-amber-200">{inspectedArtist?.role}</span>
                  </div>
                  <div className="text-xs text-purple-300/70">
                    Checking calendar to see if maestro is free or busy on selected dates
                  </div>
                </div>
              </div>

              {/* Status for selected date */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 ${
                    isSelectedDateBusy
                      ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  }`}
                >
                  <span className="text-base">{isSelectedDateBusy ? "🔴" : "🟢"}</span>
                  <span>
                    {isSelectedDateBusy ? "BUSY / BOOKED" : "FREE & AVAILABLE"} on {selectedDate}
                  </span>
                </div>

                {!isSelectedDateBusy ? (
                  <button
                    onClick={() =>
                      navigate(
                        `/schedule?artistId=${inspectedArtist?.id}&name=${encodeURIComponent(
                          inspectedArtist?.name || ""
                        )}&role=${encodeURIComponent(inspectedArtist?.role || "")}&date=${selectedDate}`
                      )
                    }
                    className="px-5 py-2.5 rounded-2xl text-xs font-black text-amber-950 transition-all hover:scale-105 shadow-xl cursor-pointer flex items-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
                      boxShadow: "0 8px 20px rgba(245, 158, 11, 0.35)",
                    }}
                  >
                    <span>✨</span> Send Concert Invite →
                  </button>
                ) : (
                  <div className="text-xs font-semibold text-red-300/80 px-2">
                    ⚠️ Conflicted — Cannot invite for this date
                  </div>
                )}

                <button
                  onClick={() => handleArtistChange("me")}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-purple-200/80 bg-white/[0.05] border border-white/10 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  ✕ My Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "🪕", label: "Confirmed Concerts", value: data.myConcerts.length },
            { icon: "📨", label: "Invites Received", value: data.invitations.length },
            { icon: "📤", label: "Invites Dispatched", value: data.sentInvitations.length },
            { icon: "✅", label: "Troupe Harmony", value: events.length },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card-luxury p-5 text-center group cursor-default"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div
                className="text-3xl font-black"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: "linear-gradient(135deg, #fef08a, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-purple-200/65 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Workspace: Calendar & Acoustic Visualizer ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Calendar Box (2 cols) */}
          <div
            ref={calRef}
            className="lg:col-span-2 card-luxury p-6 sm:p-8"
          >
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h3
                  className="text-2xl font-black"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: "linear-gradient(135deg, #fef08a, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {viewDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
                </h3>
                <span className="text-[11px] text-amber-300/80 font-medium tracking-wider">
                  Māsa Schedule & Sabha Bookings
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-200 bg-white/[0.05] border border-white/10 hover:bg-amber-400/10 hover:border-amber-400/30 transition-all"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-amber-500 shadow-md hover:scale-105 transition-all"
                >
                  Today (आज)
                </button>
                <button
                  onClick={() =>
                    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-200 bg-white/[0.05] border border-white/10 hover:bg-amber-400/10 hover:border-amber-400/30 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Indian Days Header */}
            <div className="grid grid-cols-7 text-center mb-2 border-b border-white/[0.06] pb-2">
              {INDIAN_DAYS.map((d) => (
                <div key={d.en} className="py-1">
                  <div className="text-amber-400 text-xs font-black tracking-wider">
                    {d.en}
                  </div>
                  <div className="text-[10px] text-purple-300/50 font-serif">
                    {d.sa}
                  </div>
                </div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(totalCells)].map((_, i) => {
                const dayNum = i - firstDay + 1;
                // Build cellDate strictly in local timezone
                const cellDate = new Date(
                  viewDate.getFullYear(),
                  viewDate.getMonth(),
                  dayNum
                );
                const iso = toLocalDateString(cellDate);
                const inMonth = dayNum > 0 && dayNum <= daysInMonth;
                const isToday = iso === toLocalDateString(today);
                const isSelected = iso === selectedDate;
                const dayEvents = inMonth ? eventsForDate(iso) : [];

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (inMonth) {
                        setSelectedDate(iso);
                      }
                    }}
                    disabled={!inMonth}
                    className="relative min-h-[72px] sm:min-h-[88px] rounded-2xl p-2 flex flex-col justify-between text-left transition-all duration-200 group"
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(147,51,234,0.3))"
                        : isToday
                        ? "rgba(245,158,11,0.08)"
                        : inMonth
                        ? "rgba(255,255,255,0.025)"
                        : "transparent",
                      border: isSelected
                        ? "2px solid #fbbf24"
                        : isToday
                        ? "1px solid rgba(245,158,11,0.4)"
                        : inMonth
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid transparent",
                      boxShadow: isSelected ? "0 0 25px rgba(245,158,11,0.3)" : "none",
                      cursor: inMonth ? "pointer" : "default",
                      opacity: inMonth ? 1 : 0.2,
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span
                        className={`text-xs font-black ${
                          isSelected
                            ? "text-amber-300 text-sm"
                            : isToday
                            ? "text-amber-400"
                            : "text-white/80"
                        }`}
                      >
                        {inMonth ? dayNum : ""}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                      )}
                    </div>

                    {/* Event Pill on Calendar Day */}
                    {dayEvents.length > 0 && (
                      <div className="w-full mt-auto">
                        <span
                          className="w-full block text-center text-[10px] font-black px-1.5 py-0.5 rounded-lg truncate shadow-md"
                          style={{
                            background: isInspectingOther
                              ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                              : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: isInspectingOther ? "#fff" : "#451a03",
                          }}
                        >
                          {isInspectingOther
                            ? `🔴 Booked (${dayEvents.length})`
                            : `🪕 ${dayEvents.length} ${dayEvents.length === 1 ? "Concert" : "Concerts"}`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Nada Brahma 3D Visualizer & Day Schedule */}
          <div className="flex flex-col gap-6">

            {/* Nada Brahma Acoustic 3D Visualizer */}
            <div
              className="p-4 rounded-3xl backdrop-blur-2xl bg-white/[0.04] border border-white/[0.09] overflow-hidden"
              style={{
                boxShadow:
                  "0 20px 40px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300">
                  ✦ Nada Brahma Acoustic Resonance ✦
                </span>
                <span className="text-[10px] text-purple-300/60 font-mono">
                  Pitch: 240Hz (C#)
                </span>
              </div>
              <div className="h-44 sm:h-48 rounded-2xl overflow-hidden relative">
                <MusicVisualizer3D />
              </div>
            </div>

            {/* Events for Selected Date (Fixes clicking 19th showing 18th) */}
            <div
              className="flex-1 p-6 rounded-3xl backdrop-blur-2xl bg-white/[0.04] border border-white/[0.09]"
              style={{
                boxShadow:
                  "0 20px 40px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <div className="border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    Selected Sabha Date
                  </div>
                  <h4
                    className="text-lg font-black mt-0.5"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      background: "linear-gradient(135deg, #fef08a, #f59e0b)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    📅 {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h4>
                </div>

                {/* Date availability pill */}
                {isInspectingOther && (
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      eventsForDate(selectedDate).length > 0
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {eventsForDate(selectedDate).length > 0 ? "🔴 Booked" : "🟢 Available"}
                  </span>
                )}
              </div>

              {/* Event Cards & Availability Action */}
              <div className="space-y-3 max-h-[300px] overflow-auto pr-1">
                {eventsForDate(selectedDate).length === 0 ? (
                  isInspectingOther ? (
                    <div className="text-center py-6 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="text-4xl mb-2">🟢</div>
                      <div className="text-sm font-bold text-emerald-300 mb-1">
                        {inspectedArtist?.name} is Free on this Date!
                      </div>
                      <p className="text-xs text-purple-200/70 mb-4">
                        No concerts booked for {selectedDate}. You can safely invite them for your concert troupe.
                      </p>
                      <button
                        onClick={() =>
                          navigate(
                            `/schedule?artistId=${inspectedArtist?.id}&name=${encodeURIComponent(
                              inspectedArtist?.name || ""
                            )}&role=${encodeURIComponent(inspectedArtist?.role || "")}&date=${selectedDate}`
                          )
                        }
                        className="px-5 py-2.5 rounded-xl text-xs font-black text-amber-950 transition-all hover:scale-105 shadow-md cursor-pointer"
                        style={{
                          background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
                        }}
                      >
                        ✨ Invite {inspectedArtist?.name} for this Date →
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🪕</div>
                      <p className="text-xs text-purple-200/60 font-medium">
                        No classical concerts scheduled on this date.
                      </p>
                    </div>
                  )
                ) : (
                  <>
                    {isInspectingOther && (
                      <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 mb-2 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                          <strong>{inspectedArtist?.name}</strong> is already booked on this date. Choose another date when they are free.
                        </span>
                      </div>
                    )}
                    {eventsForDate(selectedDate).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl transition-all"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(147,51,234,0.12))",
                          border: "1px solid rgba(251,191,36,0.3)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-black text-amber-200 truncate">
                            {ev.title}
                          </span>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            CONFIRMED
                          </span>
                        </div>
                        <div className="text-xs text-white/90 font-medium flex items-center gap-1.5 mb-1">
                          <span>{ev.roleIcon}</span>
                          <span>{ev.artistName}</span>
                          <span className="text-[10px] text-purple-300/70 font-normal">
                            ({ev.roleLabel})
                          </span>
                        </div>
                        <div className="text-xs text-purple-200/70">
                          📍 {ev.venue}
                        </div>
                        <div className="text-xs text-amber-300/80 mt-1 font-mono">
                          🕒 {ev.time}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Invitations & Notifications Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Invitations Drawer */}
          <div
            className="p-6 rounded-3xl backdrop-blur-2xl bg-white/[0.04] border border-white/[0.09]"
            style={{
              boxShadow:
                "0 20px 40px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {[
                { id: "received", label: "📨 Received Invites" },
                { id: "sent", label: "📤 Dispatched Invites" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={
                    activeTab === tab.id
                      ? {
                          background:
                            "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          color: "#451a03",
                          boxShadow: "0 0 15px rgba(245,158,11,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          color: "rgba(226,232,240,0.7)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[380px] overflow-auto pr-1">
              {activeTab === "received" ? (
                data.invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-2">🪘</div>
                    <p className="text-xs text-purple-200/60">No pending invitations received.</p>
                  </div>
                ) : (
                  data.invitations.map((inv) => (
                    <InvitationCard
                      key={inv.id}
                      inv={inv}
                      type="received"
                      loggedInUser={loggedInUser}
                      onRespond={handleResponse}
                    />
                  ))
                )
              ) : data.sentInvitations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-2">🪕</div>
                  <p className="text-xs text-purple-200/60">No invitations dispatched yet.</p>
                </div>
              ) : (
                data.sentInvitations.map((inv) => (
                  <InvitationCard
                    key={inv.id}
                    inv={inv}
                    type="sent"
                    loggedInUser={loggedInUser}
                  />
                ))
              )}
            </div>
          </div>

          {/* Notifications Center */}
          <div
            className="p-6 rounded-3xl backdrop-blur-2xl bg-white/[0.04] border border-white/[0.09]"
            style={{
              boxShadow:
                "0 20px 40px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3
                className="text-lg font-black"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: "linear-gradient(135deg, #fef08a, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                🔔 Sabha Notifications
              </h3>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                Real-Time Swar Stream
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-2">🪈</div>
                  <p className="text-xs text-purple-200/60">No new notices at this time.</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id || i}
                    className="p-3.5 rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
                  >
                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                      {n.message}
                    </p>
                    <div className="text-[10px] text-amber-400/80 font-mono mt-1">
                      {formatDate(n.time || n.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Classical Invitation Card Component ─────────────────────────────
function InvitationCard({ inv, type, onRespond, loggedInUser }) {
  const isAccepted = inv.status === "accepted";
  const isRejected = inv.status === "rejected";
  const isPending = inv.status === "pending";

  // Security check: Only the signed-in user who matches invited_user_id can respond!
  const isInvitedRecipient = Boolean(
    loggedInUser &&
      (inv.invited_user_id === loggedInUser.id ||
        inv.invited_user_id === loggedInUser.email ||
        (inv.invited_user_email && inv.invited_user_email === loggedInUser.email) ||
        (inv.invited_user_name &&
          loggedInUser.name &&
          inv.invited_user_name.trim().toLowerCase() === loggedInUser.name.trim().toLowerCase()))
  );

  const canRespond = type === "received" && isPending && onRespond && isInvitedRecipient;

  return (
    <div
      className="p-4 rounded-2xl transition-all duration-200 backdrop-blur-md"
      style={{
        background: isAccepted
          ? "rgba(16, 185, 129, 0.08)"
          : isRejected
          ? "rgba(239, 68, 68, 0.08)"
          : "rgba(255, 255, 255, 0.03)",
        border: isAccepted
          ? "1px solid rgba(16, 185, 129, 0.3)"
          : isRejected
          ? "1px solid rgba(239, 68, 68, 0.3)"
          : "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-bold text-white truncate max-w-[70%]">
          🪕 {inv.concert_title || inv.title || "Classical Performance"}
        </div>
        <span
          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
            isAccepted
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : isRejected
              ? "bg-red-500/20 text-red-300 border border-red-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          }`}
        >
          {inv.status}
        </span>
      </div>

      <div className="space-y-1 text-xs text-purple-200/80">
        <div>
          {type === "received" ? (
            <span>
              Organized by: <strong className="text-white">{inv.sent_by_name || inv.sent_by}</strong>
            </span>
          ) : (
            <span>
              Invited Maestro:{" "}
              <strong className="text-white">{inv.invited_user_name || inv.invited_user_id}</strong>
            </span>
          )}
        </div>
        <div>📍 Venue: {inv.venue}</div>
        <div className="text-amber-300 font-mono text-[11px]">
          🕒 {formatDate(inv.date_time)}
        </div>
      </div>

      {/* ONLY the signed in invited recipient sees Accept / Decline buttons */}
      {canRespond && (
        <div className="flex gap-2 mt-3 pt-2 border-t border-white/[0.08]">
          <button
            onClick={() => onRespond(inv.id, "accepted")}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md cursor-pointer"
          >
            ✓ Accept & Join Troupe
          </button>
          <button
            onClick={() => onRespond(inv.id, "rejected")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-300 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            Decline
          </button>
        </div>
      )}

      {/* When someone else is viewing a pending invitation, show awaiting status without action buttons */}
      {!canRespond && isPending && type === "received" && (
        <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-purple-300/70 font-medium">
          <span>⏳ Awaiting response from {inv.invited_user_name || "invited maestro"}</span>
          <span className="text-[10px] text-amber-400/80 italic font-semibold">(View Only)</span>
        </div>
      )}
    </div>
  );
}
