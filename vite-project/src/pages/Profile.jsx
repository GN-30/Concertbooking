// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";
import FloatingNotes from "../components/FloatingNotes";
import { Link } from "react-router-dom";

const ROLE_EMOJIS = {
  vocal: "🎤",
  mrudangist: "🥁",
  tabla: "🪘",
  harmonist: "🎹",
  violinist: "🎻",
  flutist: "🪈",
  veena: "🪕",
};

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
  }, []);

  const role = user?.role?.toLowerCase() || "artist";
  const emoji = ROLE_EMOJIS[role] || "🎵";

  return (
    <div
      className="min-h-screen relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(135deg, #090314 0%, #15062c 40%, #0d1238 75%, #050212 100%)",
      }}
    >
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.2) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <FloatingNotes count={12} />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <h2
          className="text-4xl font-black text-center mb-6"
          style={{
            background: "linear-gradient(135deg, #c084fc, #f472b6, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          🎵 Artist Profile
        </h2>

        <div
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6"
          style={{
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #9333ea, #ec4899)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              {emoji}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                {user?.name || "Anonymous Artist"}
              </h3>
              <p className="text-sm text-purple-300 font-mono">
                {user?.email || "No email available"}
              </p>
              <div className="pt-2">
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full capitalize"
                  style={{
                    background: "rgba(147,51,234,0.3)",
                    color: "#e9d5ff",
                    border: "1px solid rgba(192,132,252,0.4)",
                  }}
                >
                  {emoji} {user?.role || "Artist"}
                </span>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(167,139,250,0.2)",
            }}
          >
            <div className="flex justify-between items-center text-xs py-2 border-b border-white/10">
              <span className="text-purple-300 font-semibold">Artist ID:</span>
              <span className="font-mono text-white">{user?.id || "—"}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-2 border-b border-white/10">
              <span className="text-purple-300 font-semibold">Username:</span>
              <span className="font-mono text-pink-300">@{user?.username || user?.email?.split("@")[0] || "—"}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-2">
              <span className="text-purple-300 font-semibold">Status:</span>
              <span className="text-emerald-300 font-bold">● Active & Ready to Perform</span>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Link
              to="/dashboard"
              className="flex-1 py-3 text-center rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #9333ea, #ec4899)",
              }}
            >
              Go to Dashboard →
            </Link>
            <Link
              to="/schedule"
              className="flex-1 py-3 text-center rounded-xl text-xs font-bold text-purple-200 transition-all hover:scale-105"
              style={{
                background: "rgba(147,51,234,0.25)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
            >
              Schedule Concert 📅
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
