// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAllArtists, getCurrentUser, setCurrentUser } from "../services/api";

export default function Header() {
  const loc = useLocation();
  const [artists, setArtists] = useState([]);
  const [current, setCurrent] = useState(getCurrentUser()?.email || "");

  useEffect(() => {
    getAllArtists().then(setArtists);
  }, []);

  const handleSwitch = (e) => {
    setCurrent(e.target.value);
    setCurrentUser(e.target.value);
    window.location.reload(); // reload to update Dashboard context
  };

  return (
    <header className="w-full bg-gradient-to-r from-purple-50 via-white to-pink-50 border-b border-purple-100 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-3xl">🎶</span>
            <span className="tracking-tight">SwarSetu</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              loc.pathname === "/"
                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              loc.pathname === "/dashboard"
                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/schedule"
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              loc.pathname === "/schedule"
                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            Schedule
          </Link>
          <Link
            to="/register"
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              loc.pathname === "/register"
                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            Register
          </Link>
          <Link
            to="/artists"
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              loc.pathname === "/artists"
                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            Artists
          </Link>

          {/* User Switcher */}
          <select
            value={current}
            onChange={handleSwitch}
            className="ml-2 border-2 border-purple-200 rounded-lg px-4 py-2 text-sm bg-white text-gray-700 font-medium hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 cursor-pointer shadow-sm"
          >
            {artists.map((a) => (
              <option key={a.id} value={a.email}>
                {a.name} ({a.role})
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
