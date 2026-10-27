// src/components/ArtistPicker.jsx
// Authentic Indian Classical Troupe Artist Picker (Dynamic Roles & Instant Search)
import React, { useState, useEffect, useMemo } from "react";
import { getAllArtists, getCurrentUser } from "../services/api";

const ROLE_EMOJIS = {
  vocal: "🎤",
  mrudangist: "🥁",
  harmonist: "🎹",
  violinist: "🎻",
  flutist: "🪈",
  tabla: "🪘",
  veena: "🪕",
  other: "🪕",
};

const ROLE_LABELS = {
  vocal: "Vocal",
  mrudangist: "Mridangam",
  tabla: "Tabla",
  harmonist: "Harmonium",
  violinist: "Violin",
  flutist: "Venu/Bansuri",
  veena: "Veena/Sitar",
};

export default function ArtistPicker({ onAdd, excludeUserId }) {
  const [allArtists, setAllArtists] = useState([]);
  const [query, setQuery] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllArtists()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const me = getCurrentUser();
        const targetExcludeId = excludeUserId || me?.id;
        const targetEmail = me?.email?.toLowerCase();
        const targetUsername = me?.username?.toLowerCase();

        // Sender cannot invite themselves - exclude from troupe list
        const filtered = list.filter((a) => {
          if (targetExcludeId && a.id === targetExcludeId) return false;
          if (targetEmail && a.email && a.email.toLowerCase() === targetEmail) return false;
          if (targetUsername && a.username && a.username.toLowerCase() === targetUsername) return false;
          return true;
        });

        setAllArtists(filtered);
      })
      .catch((err) => {
        console.error("Failed to load artists in ArtistPicker:", err);
      })
      .finally(() => setLoading(false));
  }, [excludeUserId]);

  // Compute dynamic roles available from the loaded artists (excluding the sender)
  const dynamicRoles = useMemo(() => {
    const counts = new Map();
    allArtists.forEach((a) => {
      const r = (a.role || "other").toLowerCase();
      counts.set(r, (counts.get(r) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([key, count]) => ({
      key,
      label: ROLE_LABELS[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
      emoji: ROLE_EMOJIS[key] || "🪕",
      count,
    }));
  }, [allArtists]);

  // Live dynamic filtering by query and dynamic role
  const filteredArtists = useMemo(() => {
    const me = getCurrentUser();
    const targetExcludeId = excludeUserId || me?.id;
    const targetEmail = me?.email?.toLowerCase();
    const targetUsername = me?.username?.toLowerCase();

    return allArtists.filter((a) => {
      if (targetExcludeId && a.id === targetExcludeId) return false;
      if (targetEmail && a.email && a.email.toLowerCase() === targetEmail) return false;
      if (targetUsername && a.username && a.username.toLowerCase() === targetUsername) return false;

      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        (a.role || "").toLowerCase().includes(q);
      const matchRole =
        activeRole === "all" ||
        (a.role || "").toLowerCase() === activeRole.toLowerCase();
      return matchQuery && matchRole;
    });
  }, [allArtists, query, activeRole, excludeUserId]);

  return (
    <div className="space-y-4">
      {/* Search Input (No static dropdown) */}
      <div className="relative flex items-center">
        <svg
          width="16"
          height="16"
          style={{ width: "16px", height: "16px" }}
          className="absolute left-4 text-purple-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type maestro name, email, or instrument to search..."
          className="w-full rounded-xl pl-11 pr-10 py-3 text-xs font-medium text-white placeholder-purple-300/40 focus:outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(251,191,36,0.25)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(251,191,36,0.55)";
            e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(251,191,36,0.25)";
            e.target.style.boxShadow = "none";
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 text-xs text-purple-300/60 hover:text-white px-2 py-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dynamic Role Filter Pills (Populated directly from available artists) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveRole("all")}
          className="px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer"
          style={{
            background:
              activeRole === "all"
                ? "linear-gradient(135deg, #fef08a, #f59e0b)"
                : "rgba(255,255,255,0.05)",
            color: activeRole === "all" ? "#451a03" : "rgba(255,255,255,0.7)",
            border:
              activeRole === "all"
                ? "1px solid #fbbf24"
                : "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              activeRole === "all" ? "0 0 12px rgba(245,158,11,0.3)" : "none",
          }}
        >
          All ({allArtists.length})
        </button>
        {dynamicRoles.map(({ key, label, emoji, count }) => {
          const isSelected = activeRole === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveRole(isSelected ? "all" : key)}
              className="px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              style={{
                background: isSelected
                  ? "linear-gradient(135deg, #fef08a, #f59e0b)"
                  : "rgba(255,255,255,0.05)",
                color: isSelected ? "#451a03" : "rgba(255,255,255,0.7)",
                border: isSelected
                  ? "1px solid #fbbf24"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isSelected
                  ? "0 0 12px rgba(245,158,11,0.3)"
                  : "none",
              }}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Results List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {loading && (
          <div className="text-center py-5">
            <span className="text-xs font-semibold text-amber-300 animate-pulse">
              Loading classical maestros dynamically...
            </span>
          </div>
        )}

        {!loading && filteredArtists.length === 0 && (
          <div className="text-xs text-center py-6 text-purple-300/60 font-medium bg-white/[0.02] rounded-xl border border-white/5">
            No maestros found matching &quot;{query || activeRole}&quot;.
          </div>
        )}

        {!loading &&
          filteredArtists.map((a) => {
            const roleKey = (a.role || "").toLowerCase();
            const emoji = ROLE_EMOJIS[roleKey] || "🪕";
            const roleLabel = ROLE_LABELS[roleKey] || a.role;

            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl backdrop-blur-md transition-all hover:bg-white/[0.07]"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(147,51,234,0.25))",
                      border: "1px solid rgba(251,191,36,0.25)",
                    }}
                  >
                    {emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">
                      {a.name}
                    </div>
                    <div className="text-[10px] text-amber-300 capitalize font-medium flex items-center gap-1.5">
                      <span>
                        {emoji} {roleLabel}
                      </span>
                      {a.location && (
                        <span className="text-purple-300/40">• {a.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAdd(a)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl text-amber-950 transition-all hover:scale-105 shadow flex-shrink-0 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #fef08a, #f59e0b)",
                  }}
                >
                  + Add to Troupe
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
