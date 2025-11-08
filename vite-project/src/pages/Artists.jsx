import React, { useEffect, useState } from "react";
import { getAllArtists } from "../services/api";

export default function Artists() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    getAllArtists().then(setArtists);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Registered Artists</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {artists.map((a) => (
          <div
            key={a.id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="font-medium text-lg">{a.name}</div>
            <div className="text-sm text-gray-600">{a.email}</div>
            <div className="mt-1 text-purple-700 font-semibold">{a.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
