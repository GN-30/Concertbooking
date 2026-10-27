// src/pages/ArtistPublic.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import FloatingNotes from "../components/FloatingNotes";
import { getAllArtists } from "../services/api";

const ROLE_EMOJIS = {
  vocal: "🎤",
  mrudangist: "🥁",
  tabla: "🪘",
  harmonist: "🎹",
  violinist: "🎻",
  flutist: "🪈",
  veena: "🪕",
};

export default function ArtistPublic() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [events, setEvents] = useState([]);
  const cardRef = useRef(null);

  useEffect(() => {
    // Read artists
    getAllArtists().then((list) => {
      const found = list.find((a) => a.id === id);
      setArtist(found || null);
    });

    const invitations = JSON.parse(localStorage.getItem("invitations")) || [];
    const sessions = JSON.parse(localStorage.getItem("sessions")) || [];

    const myAccepted = invitations.filter(
      (inv) => inv.invited_user_id === id && inv.status === "accepted"
    );

    const mapped = myAccepted.map((inv) => {
      const session = sessions.find((s) => s.id === inv.session_id) || {};
      return {
        id: inv.id,
        title: inv.concert_title || session.concert_title || inv.title || "Concert",
        date_time: inv.date_time || session.date_time,
        venue: inv.venue || session.venue || "TBD",
        sent_by: inv.sent_by_name || inv.sent_by || "Organizer",
      };
    });

    setEvents(mapped);
  }, [id]);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [artist]);

  if (!artist) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#060210", color: "white" }}
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl text-center max-w-sm">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-xl font-bold mb-2">Artist not found</h3>
          <p className="text-purple-300/70 text-xs mb-5">
            The requested artist could not be located in our records.
          </p>
          <Link
            to="/artists"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)" }}
          >
            ← Back to Artists
          </Link>
        </div>
      </div>
    );
  }

  const role = artist.role?.toLowerCase() || "vocal";
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
      <FloatingNotes count={14} />

      <div ref={cardRef} className="relative z-10 max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 hover:text-pink-300 transition-colors"
        >
          ← Back to All Artists
        </Link>

        {/* Profile Header Card */}
        <div
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left"
          style={{
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #9333ea, #ec4899)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            {emoji}
          </div>

          <div className="flex-1">
            <h2
              className="text-3xl font-black mb-1"
              style={{
                background: "linear-gradient(135deg, #c084fc, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {artist.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full capitalize"
                style={{
                  background: "rgba(147,51,234,0.3)",
                  color: "#e9d5ff",
                  border: "1px solid rgba(192,132,252,0.4)",
                }}
              >
                {emoji} {artist.role}
              </span>
              <span className="text-xs text-purple-300/70 font-mono">
                {artist.email}
              </span>
            </div>
            <p className="text-xs text-purple-300/60">
              Verified SwarSetu Classical Artist & Maestro Collaborator
            </p>
          </div>
        </div>

        {/* Upcoming Accepted Concerts */}
        <div
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl"
          style={{
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <h3
            className="text-xl font-black mb-4 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #c084fc, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <span>🎪</span> Public Schedule & Confirmed Concerts
          </h3>

          {events.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🎻</div>
              <p className="text-purple-300/60 text-sm">No confirmed concerts currently scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl p-4 transition-all hover:scale-[1.01]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(147,51,234,0.15), rgba(236,72,153,0.08))",
                    border: "1px solid rgba(192,132,252,0.3)",
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-white font-bold text-sm">
                      🎤 {ev.title}
                    </h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      CONFIRMED
                    </span>
                  </div>
                  <div className="text-xs text-purple-300">
                    📍 Venue: <span className="text-white/80">{ev.venue}</span>
                  </div>
                  <div className="text-xs text-purple-300">
                    🕒 Date:{" "}
                    <span className="text-white/80">
                      {ev.date_time ? new Date(ev.date_time).toLocaleString() : "TBD"}
                    </span>
                  </div>
                  <div className="text-xs text-purple-300/70 mt-1">
                    Organized by: {ev.sent_by}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
