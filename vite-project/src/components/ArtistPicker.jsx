// src/components/ArtistPicker.jsx
import React, { useState } from "react";
import { getArtists } from "../services/api";

export default function ArtistPicker({ onAdd }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("vocal");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const res = await getArtists(role, query);
      setResults(res);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 p-3 rounded">
      <div className="flex gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="vocal">Vocal</option>
          <option value="mrudangist">Mrudangist</option>
          <option value="harmonist">Harmonist</option>
          <option value="other">Other</option>
        </select>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists by name..."
          className="flex-1 border rounded px-3 py-1"
        />

        <button
          type="button"
          onClick={search}
          className="px-3 py-1 rounded bg-purple-700 text-white"
        >
          Search
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {loading && <div className="text-sm text-gray-500">Searching…</div>}
        {!loading && results.length === 0 && (
          <div className="text-sm text-gray-500">No results</div>
        )}
        {results.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 p-2 border rounded"
          >
            <div className="flex items-center gap-3">
              <img
                src={a.avatar || "/avatar1.jpg"}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-gray-500">{a.role}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAdd(a)}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
