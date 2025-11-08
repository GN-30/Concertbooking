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
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-semibold text-purple-700">
            🎶 SwarSetu
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            className={
              loc.pathname === "/" ? "text-purple-700" : "text-gray-700"
            }
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={
              loc.pathname === "/dashboard"
                ? "text-purple-700"
                : "text-gray-700"
            }
          >
            Dashboard
          </Link>
          <Link
            to="/schedule"
            className={
              loc.pathname === "/schedule" ? "text-purple-700" : "text-gray-700"
            }
          >
            Schedule
          </Link>
          <Link
            to="/register"
            className={
              loc.pathname === "/register" ? "text-purple-700" : "text-gray-700"
            }
          >
            Register
          </Link>
          <Link
            to="/artists"
            className={
              loc.pathname === "/artists" ? "text-purple-700" : "text-gray-700"
            }
          >
            Artists
          </Link>

          {/* User Switcher */}
          <select
            value={current}
            onChange={handleSwitch}
            className="border rounded px-2 py-1 text-sm bg-white"
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
