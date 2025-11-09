import React, { useEffect, useState } from "react";
import { getAllArtists, setCurrentUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllArtists().then(setArtists);
  }, []);

  function handleArtistClick(artist) {
    setCurrentUser(artist.email);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Artists
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistClick(artist)}
              className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-purple-100 hover:border-purple-300 hover:-translate-y-2"
            >
              <div className="text-xl font-bold text-gray-800 mb-2">
                {artist.name}
              </div>
              <div className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full inline-block font-semibold capitalize mb-3">
                {artist.role}
              </div>
              <div className="text-xs text-gray-500 mb-4">{artist.email}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArtistClick(artist);
                }}
                className="w-full text-sm px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                View Dashboard
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
