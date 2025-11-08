import React, { useEffect, useState } from "react";
import { getAllArtists } from "../services/api";

export default function Artists() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    getAllArtists().then(setArtists);
  }, []);

  const roleEmojis = {
    vocal: "🎤",
    mrudangist: "🥁",
    harmonist: "🎹",
    violinist: "🎻",
    flutist: "🎺",
  };

  const roleColors = {
    vocal: "from-purple-500 to-purple-600",
    mrudangist: "from-pink-500 to-pink-600",
    harmonist: "from-blue-500 to-blue-600",
    violinist: "from-green-500 to-green-600",
    flutist: "from-orange-500 to-orange-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mb-4">
            <span className="text-6xl">🎭</span>
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Registered Artists
          </h2>
          <p className="text-gray-600 text-lg">
            Meet our talented community of {artists.length} musicians
          </p>
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200">
            <span className="text-6xl block mb-4">🎵</span>
            <p className="text-gray-500 text-lg">No artists registered yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((a) => (
              <div
                key={a.id}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-2 cursor-pointer"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${
                      roleColors[a.role.toLowerCase()] ||
                      "from-purple-500 to-pink-500"
                    } rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl text-gray-800 group-hover:text-purple-600 transition-colors">
                      {a.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <span>📧</span>
                      <span className="truncate">{a.email}</span>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center justify-center">
                  <div
                    className={`px-4 py-2 bg-gradient-to-r ${
                      roleColors[a.role.toLowerCase()] ||
                      "from-purple-500 to-pink-500"
                    } text-white rounded-full font-bold text-sm shadow-md group-hover:shadow-lg transition-all flex items-center gap-2`}
                  >
                    <span className="text-lg">
                      {roleEmojis[a.role.toLowerCase()] || "🎵"}
                    </span>
                    <span className="capitalize">{a.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
