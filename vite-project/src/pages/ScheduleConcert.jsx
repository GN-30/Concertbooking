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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">
        Schedule Concert — Send Invites
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow space-y-4"
      >
        <label className="block">
          <div className="text-sm text-gray-600">Select concert</div>
          <select
            value={selectedConcert}
            onChange={(e) => setSelectedConcert(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="">-- choose concert --</option>
            {concerts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm text-gray-600">Date & time (optional)</div>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">Venue (optional)</div>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
        </div>

        <div>
          <h4 className="font-medium mb-2">Invite Artists</h4>

          {/* If you have ArtistPicker, it will call onAdd with the artist object */}
          {/* If you don't have ArtistPicker, you can search artists via getArtists directly */}
          <ArtistPicker onAdd={addInvite} />

          <div className="mt-3 space-y-2">
            {invites.map((inv) => (
              <div
                key={inv.user_id}
                className="flex items-center gap-3 p-2 border rounded"
              >
                <div className="flex-1">
                  <div className="font-medium">{inv.name}</div>
                  <div className="text-xs text-gray-500">{inv.role}</div>
                </div>

                <input
                  type="number"
                  min="1"
                  value={inv.priority}
                  onChange={(e) =>
                    setPriority(inv.user_id, parseInt(e.target.value || "1"))
                  }
                  className="w-20 border rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => removeInvite(inv.user_id)}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-700 text-white px-4 py-2 rounded"
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
            className="px-4 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
