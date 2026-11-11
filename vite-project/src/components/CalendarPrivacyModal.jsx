// src/components/CalendarPrivacyModal.jsx
// Calendar Privacy Manager — control who can view your concert schedule
import React, { useState, useEffect } from "react";
import { getAllArtists, updateCalendarPrivacy } from "../services/api";

const ROLE_EMOJIS = {
  vocal: "🎤", vocalist: "🎤",
  mrudangist: "🥁", mridangam: "🥁",
  tabla: "🪘",
  harmonist: "🎹", harmonium: "🎹",
  violinist: "🎻", violin: "🎻",
  flutist: "🪈", venu: "🪈",
  veena: "🪕", sitar: "🪕",
};

function getRoleEmoji(role = "") {
  const key = role.toLowerCase();
  return (
    ROLE_EMOJIS[key] ||
    Object.entries(ROLE_EMOJIS).find(([k]) => key.includes(k))?.[1] ||
    "🎵"
  );
}

export default function CalendarPrivacyModal({
  isOpen,
  onClose,
  currentUser,
  onSaved,
  inline = false,
}) {
  const [artists, setArtists] = useState([]);
  const [mode, setMode] = useState("public"); // "public" | "blacklist" | "private"
  const [blocked, setBlocked] = useState(new Set());
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load artists & existing blocked list
  useEffect(() => {
    if (!inline && !isOpen) return;
    setSaved(false);
    setQuery("");

    // Set initial mode
    const currentMode =
      currentUser?.calendar_visibility ||
      currentUser?.visibility ||
      "public";
    setMode(currentMode);

    // Pre-fill from currentUser's blocked list
    const existing = Array.isArray(currentUser?.calendar_hidden_users)
      ? currentUser.calendar_hidden_users
      : Array.isArray(currentUser?.hiddenUsers)
      ? currentUser.hiddenUsers
      : [];
    setBlocked(new Set(existing));

    setLoading(true);
    getAllArtists()
      .then((list) => {
        setArtists(
          (list || []).filter(
            (a) =>
              a.id !== currentUser?.id &&
              a.email !== currentUser?.email &&
              a.username !== currentUser?.username
          )
        );
      })
      .finally(() => setLoading(false));
  }, [isOpen, inline, currentUser]);

  // Close on Escape key (modal mode only)
  useEffect(() => {
    if (inline || !isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, inline, onClose]);

  const toggle = (artist) => {
    const aId = typeof artist === "string" ? artist : artist?.id;
    const email = typeof artist === "object" ? artist?.email : "";
    const username = typeof artist === "object" ? artist?.username : "";
    const name = typeof artist === "object" ? artist?.name : "";

    setBlocked((prev) => {
      const next = new Set(prev);
      const isAlreadyBlocked =
        (aId && next.has(aId)) ||
        (email && next.has(email)) ||
        (username && next.has(username)) ||
        (name && next.has(name));

      if (isAlreadyBlocked) {
        if (aId) next.delete(aId);
        if (email) next.delete(email);
        if (username) next.delete(username);
        if (name) next.delete(name);
      } else {
        if (aId) next.add(aId);
        if (email) next.add(email);
        if (username) next.add(username);
        if (name) next.add(name);
      }
      return next;
    });

    if (mode !== "blacklist") {
      setMode("blacklist");
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const blockedList = [...blocked];
      const effectiveMode =
        mode === "private"
          ? "private"
          : blockedList.length > 0
          ? "blacklist"
          : mode === "blacklist"
          ? "blacklist"
          : "public";

      const updated = await updateCalendarPrivacy(currentUser, {
        visibility: effectiveMode,
        calendar_visibility: effectiveMode,
        allowedUsers: [],
        calendar_allowed_users: [],
        hiddenUsers: effectiveMode === "blacklist" ? blockedList : [],
        calendar_hidden_users: effectiveMode === "blacklist" ? blockedList : [],
      });

      const updatedUserObj = {
        ...currentUser,
        calendar_visibility: effectiveMode,
        visibility: effectiveMode,
        calendar_hidden_users: effectiveMode === "blacklist" ? blockedList : [],
        hiddenUsers: effectiveMode === "blacklist" ? blockedList : [],
        calendar_allowed_users: [],
        allowedUsers: [],
        ...updated,
      };

      setSaved(true);
      if (onSaved) {
        onSaved(updatedUserObj);
      }

      try {
        window.dispatchEvent(
          new CustomEvent("swarsethu:userChanged", {
            detail: { email: currentUser.email || currentUser.id, user: updatedUserObj },
          })
        );
      } catch (e) {}

      if (!inline && onClose) {
        setTimeout(() => {
          setSaved(false);
          onClose();
        }, 800);
      } else {
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save privacy:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!inline && !isOpen) return null;

  const filtered = artists.filter((a) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      a.name?.toLowerCase().includes(q) ||
      (a.role || "").toLowerCase().includes(q)
    );
  });

  const cardContent = (
    <div
      className={`w-full flex flex-col overflow-hidden ${
        inline ? "rounded-3xl" : "max-w-md rounded-3xl"
      }`}
      style={{
        background: "linear-gradient(160deg, rgba(14,6,30,0.99) 0%, rgba(5,2,14,1) 100%)",
        border: "1px solid rgba(251,191,36,0.22)",
        boxShadow: inline
          ? "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 32px 80px -12px rgba(0,0,0,0.9), 0 0 50px rgba(147,51,234,0.1)",
        maxHeight: inline ? "none" : "85vh",
      }}
    >
      {/* Gold top accent line */}
      <div
        className="h-[2px] w-full flex-shrink-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(245,158,11,0.7) 35%, rgba(192,132,252,0.6) 70%, transparent)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <div
              className="text-base font-black"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: "linear-gradient(135deg, #fef08a, #f59e0b, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Calendar Privacy Settings
            </div>
            <div className="text-[11px] text-purple-300/60 mt-0.5">
              Control who can see your concert schedule and availability dates
            </div>
          </div>
        </div>
        {!inline && onClose && (
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-purple-300/50 hover:text-white transition-colors text-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Privacy Mode Selector Tabs */}
      <div className="px-6 pb-4 flex-shrink-0">
        <div
          className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            type="button"
            onClick={() => setMode("public")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              mode === "public"
                ? "text-amber-300 shadow-md"
                : "text-purple-300/60 hover:text-white"
            }`}
            style={{
              background: mode === "public" ? "rgba(245,158,11,0.2)" : "transparent",
              border: mode === "public" ? "1px solid rgba(245,158,11,0.4)" : "1px solid transparent",
            }}
          >
            🌐 Public
          </button>

          <button
            type="button"
            onClick={() => setMode("blacklist")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              mode === "blacklist"
                ? "text-purple-300 shadow-md"
                : "text-purple-300/60 hover:text-white"
            }`}
            style={{
              background: mode === "blacklist" ? "rgba(168,85,247,0.22)" : "transparent",
              border: mode === "blacklist" ? "1px solid rgba(168,85,247,0.4)" : "1px solid transparent",
            }}
          >
            🚫 Partial
          </button>

          <button
            type="button"
            onClick={() => setMode("private")}
            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
              mode === "private"
                ? "text-rose-300 shadow-md"
                : "text-purple-300/60 hover:text-white"
            }`}
            style={{
              background: mode === "private" ? "rgba(244,63,94,0.2)" : "transparent",
              border: mode === "private" ? "1px solid rgba(244,63,94,0.4)" : "1px solid transparent",
            }}
          >
            🔒 Private
          </button>
        </div>

        {/* Mode explanation */}
        <div className="mt-2 text-[11px] text-purple-300/60 leading-relaxed px-1">
          {mode === "public" && "Public: All artists and organizers can view your concert calendar."}
          {mode === "blacklist" && "Partial: Your calendar is visible, EXCEPT to specific blocked artists selected below."}
          {mode === "private" && "Private (Only Me): Strictly private. Nobody else can view your calendar dates."}
        </div>
      </div>

      {/* Search & Artist List (Active when in blacklist mode or customizing blocked list) */}
      {mode !== "private" && (
        <div className="px-6 pb-3 flex-shrink-0">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 text-xs pointer-events-none">
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists to block/unblock…"
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs text-white placeholder-purple-300/40 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(251,191,36,0.5)";
                e.target.style.boxShadow = "0 0 0 2px rgba(245,158,11,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(251,191,36,0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300/50 hover:text-white px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Block count badge */}
          {blocked.size > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-rose-300 font-semibold">
                🚫 {blocked.size} artist{blocked.size !== 1 ? "s" : ""} hidden from calendar
              </span>
              <button
                type="button"
                onClick={() => {
                  setBlocked(new Set());
                  if (mode === "blacklist") setMode("public");
                }}
                className="text-[10px] text-purple-300/50 hover:text-rose-400 transition-colors font-semibold"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Artist List */}
      {mode !== "private" && (
        <div
          className={`overflow-y-auto flex-1 px-6 pb-4 space-y-2 ${
            inline ? "max-h-60" : "max-h-72"
          }`}
        >
          {loading && (
            <div className="text-center py-6">
              <span className="text-xs text-amber-300 animate-pulse">Loading artists…</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-6 text-xs text-purple-300/50">
              No matching artists found
            </div>
          )}

          {!loading &&
            filtered.map((a) => {
              const emoji = getRoleEmoji(a.role);
              const isBlocked =
                blocked.has(a.id) ||
                blocked.has(a.email) ||
                (a.name && blocked.has(a.name)) ||
                (a.username && blocked.has(a.username));

              return (
                <div
                  key={a.id}
                  onClick={() => toggle(a)}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-150 select-none"
                  style={{
                    background: isBlocked
                      ? "rgba(244,63,94,0.12)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      isBlocked ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.07)"
                    }`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isBlocked) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isBlocked) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(147,51,234,0.22))",
                        border: "1px solid rgba(251,191,36,0.2)",
                      }}
                    >
                      {emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{a.name}</div>
                      <div className="text-[10px] text-amber-300/70 capitalize">{a.role}</div>
                    </div>
                  </div>

                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: isBlocked ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.06)",
                      border: `1.5px solid ${
                        isBlocked ? "rgba(244,63,94,0.7)" : "rgba(255,255,255,0.15)"
                      }`,
                    }}
                  >
                    {isBlocked ? (
                      <span className="text-rose-300 text-xs font-black">✕</span>
                    ) : (
                      <span className="text-white/20 text-xs">+</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-3 px-6 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {!inline && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-200/60 hover:text-white transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Cancel
          </button>
        ) : (
          <span className="text-[11px] text-purple-300/50">
            {mode === "private"
              ? "🔒 Calendar is Private"
              : mode === "blacklist"
              ? `🚫 ${blocked.size} artist${blocked.size !== 1 ? "s" : ""} restricted`
              : "🌐 Calendar is Public"}
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="px-6 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-70 flex items-center gap-2 cursor-pointer ml-auto"
          style={{
            background: saved
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
            color: saved ? "#fff" : "#451a03",
            boxShadow: saved
              ? "0 6px 20px rgba(16,185,129,0.4)"
              : "0 6px 20px rgba(245,158,11,0.3)",
          }}
        >
          {saving ? (
            <>
              <span
                className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white"
                style={{ animation: "spin 0.7s linear infinite" }}
              />
              Saving…
            </>
          ) : saved ? (
            "✓ Saved Preferences!"
          ) : (
            "🛡️ Save Privacy"
          )}
        </button>
      </div>
    </div>
  );

  if (inline) {
    return cardContent;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(5,0,16,0.8)", backdropFilter: "blur(10px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {cardContent}
    </div>
  );
}
