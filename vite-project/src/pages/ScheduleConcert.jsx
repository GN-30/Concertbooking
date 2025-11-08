// src/pages/ScheduleConcert.jsx
import React, { useEffect, useState } from "react";
import { getConcerts, getArtists, createSession } from "../services/api";
import ArtistPicker from "../components/ArtistPicker"; // optional — if you already have it
import { useNavigate } from "react-router-dom";

export default function ScheduleConcert() {
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [venue, setVenue] = useState("");
  const [invites, setInvites] = useState([]); // { user_id, name, role, priority }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const c = await getConcerts();
      setConcerts(c);
    }
    load();
  }, []);

  function addInvite(artist) {
    if (invites.some((i) => i.user_id === artist.id)) return;
    setInvites((prev) => [
      ...prev,
      {
        user_id: artist.id,
        name: artist.name,
        role: artist.role,
        priority: prev.length + 1,
      },
    ]);
  }

  function removeInvite(user_id) {
    setInvites((prev) => prev.filter((i) => i.user_id !== user_id));
  }

  function setPriority(user_id, p) {
    setInvites((prev) =>
      prev.map((i) => (i.user_id === user_id ? { ...i, priority: p } : i))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedConcert) {
      alert("Please select a concert.");
      return;
    }
    if (!invites.length) {
      alert("Add at least one artist to invite.");
      return;
    }

    const concertObj = concerts.find((c) => c.id === selectedConcert);
    const payload = {
      concert_id: selectedConcert,
      concert_title: concertObj?.title,
      date_time: dateTime || null,
      venue: venue || concertObj?.venue || null,
      invites: invites.map((i) => ({
        user_id: i.user_id,
        role: i.role,
        priority: i.priority,
      })),
    };

    try {
      setLoading(true);
      await createSession(payload);
      alert("Invitations sent!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to send invites");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-4xl">🎭</span>
            Schedule Concert
          </h2>
          <p className="text-gray-600 ml-14">
            Send invitations to artists for your upcoming concert
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl border border-purple-100 space-y-6"
        >
          {/* Concert Selection */}
          <div>
            <label className="block">
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">🎵</span>
                Select Concert
              </div>
              <select
                value={selectedConcert}
                onChange={(e) => setSelectedConcert(e.target.value)}
                className="mt-1 w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-800 font-medium hover:border-purple-300"
              >
                <option value="">-- Choose a concert --</option>
                {concerts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Date & Venue */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">📅</span>
                Date & Time{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (optional)
                </span>
              </div>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="mt-1 w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300"
              />
            </label>

            <label className="block">
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">📍</span>
                Venue{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (optional)
                </span>
              </div>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue location"
                className="mt-1 w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300"
              />
            </label>
          </div>

          {/* Artist Invitation Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h4 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <span className="text-xl">👥</span>
              Invite Artists
            </h4>

            <ArtistPicker onAdd={addInvite} />

            {/* Invited Artists List */}
            <div className="mt-5 space-y-3">
              {invites.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <span className="text-4xl block mb-2">🎤</span>
                  <p>No artists invited yet. Start adding artists above!</p>
                </div>
              ) : (
                invites.map((inv) => (
                  <div
                    key={inv.user_id}
                    className="flex items-center gap-4 p-4 border-2 border-purple-200 rounded-xl bg-white hover:shadow-md transition-all duration-300 hover:border-purple-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {inv.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{inv.name}</div>
                      <div className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full inline-block font-medium mt-1">
                        {inv.role}
                      </div>
                    </div>

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
                      ✕ Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  📤 Send Invitations
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setInvites([]);
                setDateTime("");
                setVenue("");
              }}
              className="px-6 py-4 border-2 border-purple-200 text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-all duration-300 hover:scale-105 hover:border-purple-300"
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
