// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getDashboard,
  respondInvitation,
  getNotifications,
  getCurrentUser,
} from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    currentUser: {},
    myConcerts: [],
    invitations: [],
    sentInvitations: [],
  });
  const [notifications, setNotifications] = useState([]);

  async function loadAll() {
    try {
      const res = await getDashboard();
      setData(res);
      const notes = await getNotifications(res.currentUser.email);
      setNotifications(notes);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResponse(inviteId, status) {
    try {
      await respondInvitation(inviteId, status);
      await loadAll();
      alert(`You ${status} this invitation`);
    } catch (err) {
      console.error("Failed to respond:", err);
      alert("Failed to update invitation");
    }
  }

  const user = data.currentUser || getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          {user?.name && (
            <div className="flex items-center gap-3 mt-4 bg-white rounded-xl px-5 py-3 shadow-sm border border-purple-100">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🔔</span> Notifications
            </h3>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-sm font-medium text-green-800">
                    {n.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span>🕒</span>
                    {new Date(n.time).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your Scheduled Sessions */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🎵</span> Your Scheduled Sessions
          </h3>
          <div className="space-y-4">
            {data.myConcerts.length ? (
              data.myConcerts.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-purple-100 hover:border-purple-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 mb-2">
                        {c.concert_title || c.concert_id}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="text-purple-500">📍</span>
                        <span>Venue: {c.venue || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <span>🕒</span>
                        <span>
                          Created: {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                <span className="text-4xl mb-2 block">🎭</span>
                <p className="text-gray-500">
                  You haven't scheduled any sessions yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Sent Invitations */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📤</span> Sent Invitations
          </h3>
          <div className="space-y-4">
            {data.sentInvitations.length ? (
              data.sentInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-purple-100 hover:border-purple-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 mb-2">
                        {inv.title || inv.concert_title || inv.concert_id}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">To (id):</span>{" "}
                          {inv.invited_user_id}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                            {inv.role}
                          </span>
                          <span className="text-gray-500">
                            Priority:{" "}
                            <span className="font-semibold">
                              {inv.priority ?? "—"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <span className="font-medium text-gray-700">
                            Status:
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full font-semibold ${
                              inv.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : inv.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 ml-4">
                      {new Date(inv.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                <span className="text-4xl mb-2 block">✉️</span>
                <p className="text-gray-500">No invites sent yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Received Invitations */}
        <section>
          <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📥</span> Received Invitations
          </h3>
          <div className="space-y-4">
            {data.invitations.length ? (
              data.invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-purple-100 hover:border-purple-300"
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 mb-2">
                        {inv.concert_title || inv.title || inv.concert_id}
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="font-medium text-gray-700">From:</span>
                        <span className="text-purple-700 font-semibold">
                          {inv.sent_by_name
                            ? `${inv.sent_by_name} (${inv.sent_by_role || "—"})`
                            : inv.sent_by || "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                          {inv.role}
                        </span>
                        <span className="text-gray-500">
                          Priority:{" "}
                          <span className="font-semibold">
                            {inv.priority ?? "—"}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700">
                          Status:
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full font-semibold ${
                            inv.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : inv.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>

                    {inv.status === "pending" ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleResponseWrapper(inv.id, "accepted")
                          }
                          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() =>
                            handleResponseWrapper(inv.id, "rejected")
                          }
                          className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
                        >
                          ✕ Decline
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 capitalize font-medium">
                        {inv.status}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                <span className="text-4xl mb-2 block">📭</span>
                <p className="text-gray-500">No invites received yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  // wrapper to avoid re-defining inline
  async function handleResponseWrapper(inviteId, status) {
    try {
      await respondInvitation(inviteId, status);
      await loadAll();
      alert(`You ${status} this invitation`);
    } catch (err) {
      console.error(err);
      alert("Failed to update invitation");
    }
  }
}
