// src/pages/RolePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ConcertCard from "../components/ConcertCard";
import { getByRole } from "../services/api";
import FloatingNotes from "../components/FloatingNotes";

export default function RolePage() {
  const { roleName } = useParams();
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getByRole(roleName);
        setList(res.invitations || res.artists || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [roleName]);

  return (
    <div
      className="min-h-screen relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(135deg, #090314 0%, #15062c 40%, #0d1238 75%, #050212 100%)",
      }}
    >
      <FloatingNotes count={12} />
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 hover:text-pink-300 mb-6 transition-colors"
        >
          ← Back to Artists
        </Link>
        <h2
          className="text-4xl font-black mb-8 capitalize"
          style={{
            background: "linear-gradient(135deg, #c084fc, #f472b6, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Role: {roleName}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {list.length ? (
            list.map((c) => (
              <ConcertCard key={c.id} concert={c} onAccept={() => {}} />
            ))
          ) : (
            <div className="col-span-2 text-center py-16 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="text-4xl mb-3">🎵</div>
              <p className="text-purple-300/60 text-sm">No items found for this role yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
