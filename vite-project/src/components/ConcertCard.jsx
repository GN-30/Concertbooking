// src/components/ConcertCard.jsx
import React from "react";

export default function ConcertCard({ concert, onAccept, onDecline }) {
  return (
    <div
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(147,51,234,0.4), rgba(236,72,153,0.3))",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          🎵
        </div>
        <div className="flex-1">
          <div className="text-xs text-purple-300/80 font-mono">
            🕒 {concert.date_time ? new Date(concert.date_time).toLocaleString() : "Date TBD"}
          </div>
          <div className="font-bold text-base text-white mt-1">
            {concert.title || concert.concert_title || "Concert Performance"}
          </div>
          <div className="text-xs text-purple-200/70 mt-1">
            📍 {concert.venue || "Venue TBD"}
          </div>
          {onAccept && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAccept(concert)}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all hover:scale-105"
              >
                ✓ Accept
              </button>
              {onDecline && (
                <button
                  type="button"
                  onClick={() => onDecline(concert)}
                  className="px-4 py-1.5 rounded-lg border border-red-400/50 text-red-300 font-bold text-xs hover:bg-red-500/20 transition-all"
                >
                  Decline
                </button>
              )}
            </div>
          )}
        </div>
        {concert.priority && (
          <div className="text-xs font-bold px-2 py-1 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/30">
            P{concert.priority}
          </div>
        )}
      </div>
    </div>
  );
}
