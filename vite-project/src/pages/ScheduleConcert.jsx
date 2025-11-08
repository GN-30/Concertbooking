// src/pages/ScheduleConcert.jsx
import React, { useEffect, useState } from "react";
import { getConcerts, createSession } from "../services/api";
import ArtistPicker from "../components/ArtistPicker";
import { useNavigate } from "react-router-dom";

export default function ScheduleConcert() {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [venue, setVenue] = useState("");
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getConcerts().then(setConcerts);
  }, []);

  function addInvite(artist) {
    if (invites.some((i) => i.user_id === artist.id)) return;
    setInvites((p) => [
      ...p,
      {
        user_id: artist.id,
        name: artist.name,
        role: artist.role,
        priority: p.length + 1,
      },
    ]);
  }

  function removeInvite(id) {
    setInvites((p) => p.filter((i) => i.user_id !== id));
  }

  function setPriority(id, val) {
    setInvites((p) =>
      p.map((i) => (i.user_id === id ? { ...i, priority: val } : i))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedConcert) return alert("Please select a concert");
    if (!venue.trim()) return alert("Please enter a venue");
    if (!dateTime.trim()) return alert("Please choose a date and time");
    if (!invites.length) return alert("Add at least one artist to invite");

    const concertObj = concerts.find((c) => c.id === selectedConcert);
    const payload = {
      concert_id: selectedConcert,
      concert_title: concertObj?.title,
      date_time: dateTime,
      venue: venue,
      invites: invites.map((i) => ({
        user_id: i.user_id,
        role: i.role,
        priority: i.priority,
      })),
    };

    setLoading(true);
    try {
      await createSession(payload);
      alert("Invitations sent successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message || "Error sending invites");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Schedule a Concert
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-purple-100 space-y-6"
        >
          <label className="block">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Select Concert
            </div>
            <select
              className="mt-1 w-full border-2 border-purple-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300"
              value={selectedConcert}
              onChange={(e) => setSelectedConcert(e.target.value)}
              required
            >
              <option value="">-- Choose a concert --</option>
              {concerts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Date & Time
              </div>
              <input
                type="datetime-local"
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Venue
              </div>
              <input
                type="text"
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue location"
                required
              />
            </label>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h4 className="font-bold text-lg mb-4 text-gray-800">
              Invite Artists
            </h4>
            <ArtistPicker onAdd={addInvite} />
            <div className="mt-4 space-y-3">
              {invites.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-xl border-2 border-dashed border-purple-200">
                  No artists invited yet. Start adding artists above!
                </div>
              ) : (
                invites.map((inv) => (
                  <div
                    key={inv.user_id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-2 border-purple-200 rounded-xl bg-white hover:shadow-md transition-all hover:border-purple-300"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{inv.name}</div>
                      <div className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full inline-block font-medium mt-1">
                        {inv.role}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-600">
                          Priority:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={inv.priority}
                          onChange={(e) =>
                            setPriority(
                              inv.user_id,
                              parseInt(e.target.value || "1")
                            )
                          }
                          className="w-20 border-2 border-purple-200 rounded-lg px-3 py-2 font-semibold text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInvite(inv.user_id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm hover:scale-105"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {loading ? "Sending..." : "Send Invites"}
            </button>
            <button
              type="button"
              onClick={() => {
                setInvites([]);
                setDateTime("");
                setVenue("");
              }}
              className="w-full sm:w-auto border-2 border-purple-200 text-purple-700 rounded-xl font-bold px-6 py-4 hover:bg-purple-50 transition-all duration-300 hover:scale-105 hover:border-purple-300"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
