// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  getDashboard,
  respondInvitation,
  getNotifications,
  getAllArtists,
  getCurrentUser,
} from "../services/api";

function formatDate(dt) {
  if (!dt) return "N/A";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatISODateOnly(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Dashboard() {
  const [data, setData] = useState({
    currentUser: {},
    myConcerts: [],
    invitations: [],
    sentInvitations: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [artists, setArtists] = useState([]);

  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(formatISODateOnly(today));
  const [filterMode, setFilterMode] = useState("me");

  const loadAll = useCallback(async () => {
    try {
      const res = await getDashboard();
      setData(res);
      const notes = await getNotifications(res.currentUser.email);
      setNotifications(notes);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  }, []);

  useEffect(() => {
    // initial load
    loadAll();
    getAllArtists().then(setArtists);

    // listen for user change event
    function onUserChanged() {
      loadAll();
    }

    window.addEventListener("swarsethu:userChanged", onUserChanged);
    return () => {
      window.removeEventListener("swarsethu:userChanged", onUserChanged);
    };
  }, [loadAll]);

  function readAllSessions() {
    return JSON.parse(localStorage.getItem("sessions")) || [];
  }

  function readAllInvitations() {
    return JSON.parse(localStorage.getItem("invitations")) || [];
  }

  const events = useMemo(() => {
    const sessions = readAllSessions();
    const invites = readAllInvitations();
    const sessionMap = {};
    sessions.forEach((s) => (sessionMap[s.id] = s));
    const artistMap = {};
    const allArtists = JSON.parse(localStorage.getItem("artists")) || [];
    allArtists.forEach((a) => (artistMap[a.id] = a));

    return invites
      .filter((inv) => inv.status === "accepted")
      .map((inv) => {
        const session = sessionMap[inv.session_id] || {};
        const artist = artistMap[inv.invited_user_id] || {};
        const date = session.date_time || inv.date_time;
        return {
          id: inv.id,
          day: date ? formatISODateOnly(date) : null,
          title: session.concert_title || inv.concert_title,
          venue: session.venue || inv.venue,
          time: formatDate(date),
          artistName: artist.name || inv.invited_user_id,
          artistId: inv.invited_user_id,
          sentBy: inv.sent_by_name || inv.sent_by,
        };
      })
      .filter((e) => e.day);
  }, [data]);

  function eventsForDate(date) {
    const user = getCurrentUser();
    if (filterMode === "all") return events.filter((e) => e.day === date);
    if (filterMode === "me")
      return events.filter((e) => e.day === date && e.artistId === user?.id);
    return events.filter((e) => e.day === date && e.artistId === filterMode);
  }

  const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const daysInMonth = end.getDate();
  const firstDay = start.getDay();
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

  const handleResponse = async (id, status) => {
    await respondInvitation(id, status);
    loadAll();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Dashboard
        </h2>

        {/* Current user info */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 bg-white rounded-xl px-4 sm:px-5 py-4 shadow-md border border-purple-100">
          <div className="text-gray-700 font-medium">
            Logged in as:{" "}
            <span className="font-bold text-purple-600">
              {data.currentUser.name}
            </span>{" "}
            <span className="text-gray-500">({data.currentUser.role})</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-semibold text-gray-700">View:</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="border-2 border-purple-200 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300 w-full sm:w-auto"
            >
              <option value="me">My Calendar</option>
              <option value="all">All Artists</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-purple-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-800">
                {viewDate.toLocaleString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear(),
                        viewDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                  className="border-2 border-purple-200 px-4 py-2 rounded-lg font-semibold text-purple-600 hover:bg-purple-50 transition-all hover:border-purple-300"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setViewDate(
                      new Date(today.getFullYear(), today.getMonth(), 1)
                    )
                  }
                  className="border-2 border-purple-200 px-4 py-2 rounded-lg font-semibold text-purple-600 hover:bg-purple-50 transition-all hover:border-purple-300"
                >
                  Today
                </button>
                <button
                  onClick={() =>
                    setViewDate(
                      new Date(
                        viewDate.getFullYear(),
                        viewDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                  className="border-2 border-purple-200 px-4 py-2 rounded-lg font-semibold text-purple-600 hover:bg-purple-50 transition-all hover:border-purple-300"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-bold text-gray-600 border-b-2 border-purple-100 pb-3 mb-3">
              {DAY_NAMES.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {[...Array(totalCells)].map((_, i) => {
                const dayNum = i - firstDay + 1;
                const date = new Date(
                  viewDate.getFullYear(),
                  viewDate.getMonth(),
                  dayNum
                );
                const iso = formatISODateOnly(date);
                const dayEvents = eventsForDate(iso);
                const inMonth = dayNum > 0 && dayNum <= daysInMonth;
                const isToday = iso === formatISODateOnly(today);

                return (
                  <div
                    key={i}
                    className={`min-h-[70px] sm:min-h-[90px] border-2 rounded-xl p-1 sm:p-2 flex flex-col justify-between transition-all ${
                      inMonth
                        ? isToday
                          ? "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 shadow-md"
                          : "bg-white border-purple-100 hover:border-purple-300 hover:shadow-md"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}
                  >
                    <div
                      className={`text-sm font-bold ${
                        isToday ? "text-purple-700" : ""
                      }`}
                    >
                      {inMonth ? dayNum : ""}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="text-xs font-semibold px-2 py-1 bg-purple-600 text-white rounded-full text-center">
                        {dayEvents.length} event
                        {dayEvents.length > 1 ? "s" : ""}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedDate(iso)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events for selected date */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-purple-100">
            <h4 className="font-bold text-lg sm:text-xl mb-4 text-gray-800">
              Events on {new Date(selectedDate).toLocaleDateString()}
            </h4>
            <div className="space-y-3 max-h-[400px] sm:max-h-[500px] overflow-auto">
              {eventsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
                  No events scheduled
                </p>
              ) : (
                eventsForDate(selectedDate).map((ev) => (
                  <div
                    key={ev.id}
                    className="border-2 border-purple-100 rounded-xl p-4 hover:border-purple-300 transition-all hover:shadow-md bg-gradient-to-br from-white to-purple-50"
                  >
                    <div className="font-bold text-base mb-2 text-gray-800">
                      {ev.title}
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Artist:</span>{" "}
                      {ev.artistName}
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Invited by:</span>{" "}
                      {ev.sentBy}
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Venue:</span> {ev.venue}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Date & Time:</span>{" "}
                      {ev.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Invitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Received */}
          <section className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-purple-100">
            <h3 className="font-bold text-xl sm:text-2xl mb-4 text-gray-800">
              Received Invitations
            </h3>
            <div className="space-y-3">
              {data.invitations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
                  No invites received
                </p>
              )}
              {data.invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="border-2 border-purple-100 rounded-xl p-4 hover:border-purple-300 transition-all hover:shadow-md"
                >
                  <div className="font-bold text-base mb-2 text-gray-800">
                    {inv.concert_title || inv.title}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">Venue:</span> {inv.venue}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">Date & Time:</span>{" "}
                    {formatDate(inv.date_time)}
                  </div>
                  <div className="text-sm text-purple-700 mb-1 font-semibold">
                    From: {inv.sent_by_name || inv.sent_by}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`font-bold ${
                        inv.status === "accepted"
                          ? "text-green-600"
                          : inv.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  {inv.status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-3">
                      <button
                        onClick={() => handleResponse(inv.id, "accepted")}
                        className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg hover:scale-105 w-full sm:w-auto"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(inv.id, "rejected")}
                        className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all hover:shadow-lg hover:scale-105 w-full sm:w-auto"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Sent */}
          <section className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-purple-100">
            <h3 className="font-bold text-xl sm:text-2xl mb-4 text-gray-800">
              Sent Invitations
            </h3>
            <div className="space-y-3">
              {data.sentInvitations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
                  No invites sent
                </p>
              )}
              {data.sentInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="border-2 border-purple-100 rounded-xl p-4 hover:border-purple-300 transition-all hover:shadow-md"
                >
                  <div className="font-bold text-base mb-2 text-gray-800">
                    {inv.title}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">To:</span>{" "}
                    {inv.invited_user_id}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">Venue:</span> {inv.venue}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Date & Time:</span>{" "}
                    {formatDate(inv.date_time)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`font-bold ${
                        inv.status === "accepted"
                          ? "text-green-600"
                          : inv.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
