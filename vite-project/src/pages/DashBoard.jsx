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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-6">Dashboard</h2>

      {user?.name && (
        <div className="mb-6 text-gray-700">
          Logged in as: <span className="font-semibold">{user.name}</span> (
          {user.role})
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Notifications</h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-green-50 border border-green-200 p-3 rounded"
              >
                <div className="text-sm text-green-800">{n.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(n.time).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Your Scheduled Sessions */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Your Scheduled Sessions</h3>
        <div className="space-y-3">
          {data.myConcerts.length ? (
            data.myConcerts.map((c) => (
              <div key={c.id} className="bg-white rounded shadow p-4 border">
                <div className="font-medium">
                  {c.concert_title || c.concert_id}
                </div>
                <div className="text-sm text-gray-600">
                  Venue: {c.venue || "N/A"}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Created at: {new Date(c.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              You haven't scheduled any sessions yet.
            </div>
          )}
        </div>
      </section>

      {/* Sent Invitations */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Sent Invitations</h3>
        <div className="space-y-3">
          {data.sentInvitations.length ? (
            data.sentInvitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded shadow p-4 border flex justify-between items-start"
              >
                <div>
                  <div className="font-medium">
                    {inv.title || inv.concert_title || inv.concert_id}
                  </div>
                  <div className="text-sm text-gray-600">
                    To (id): {inv.invited_user_id}
                  </div>
                  <div className="text-sm text-gray-600">
                    Role: {inv.role} | Priority: {inv.priority ?? "—"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status:{" "}
                    <span
                      className={
                        inv.status === "accepted"
                          ? "text-green-600"
                          : inv.status === "rejected"
                          ? "text-red-500"
                          : "text-yellow-600"
                      }
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(inv.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No invites sent yet.</div>
          )}
        </div>
      </section>

      {/* Received Invitations */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Received Invitations</h3>
        <div className="space-y-3">
          {data.invitations.length ? (
            data.invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded shadow p-4 border flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {inv.concert_title || inv.title || inv.concert_id}
                  </div>

                  <div className="text-sm text-purple-700 mt-1">
                    From:{" "}
                    {inv.sent_by_name
                      ? `${inv.sent_by_name} (${inv.sent_by_role || "—"})`
                      : inv.sent_by || "Unknown"}
                  </div>

                  <div className="text-sm text-gray-600">
                    Role: {inv.role} | Priority: {inv.priority ?? "—"}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    Status:{" "}
                    <span
                      className={
                        inv.status === "accepted"
                          ? "text-green-600"
                          : inv.status === "rejected"
                          ? "text-red-500"
                          : "text-yellow-600"
                      }
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>

                {inv.status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponseWrapper(inv.id, "accepted")}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponseWrapper(inv.id, "rejected")}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{inv.status}</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              No invites received yet.
            </div>
          )}
        </div>
      </section>
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
