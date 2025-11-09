// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-purple-50 via-white to-pink-50 border-b border-purple-100 shadow-md sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center font-bold text-xl transition-colors"
          >
            <span className="text-3xl mr-2">🎵</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all">
              SwarSethu
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavItem to="/" label="Home" location={location} />
            <NavItem to="/dashboard" label="Dashboard" location={location} />
            <NavItem to="/schedule" label="Schedule" location={location} />
            <NavItem to="/artists" label="Artists" location={location} />
            <NavItem to="/register" label="Register" location={location} />
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-purple-100 focus:outline-none transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-purple-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <MobileLink
              to="/"
              label="Home"
              location={location}
              setMenuOpen={setMenuOpen}
            />
            <MobileLink
              to="/dashboard"
              label="Dashboard"
              location={location}
              setMenuOpen={setMenuOpen}
            />
            <MobileLink
              to="/schedule"
              label="Schedule"
              location={location}
              setMenuOpen={setMenuOpen}
            />
            <MobileLink
              to="/artists"
              label="Artists"
              location={location}
              setMenuOpen={setMenuOpen}
            />
            <MobileLink
              to="/register"
              label="Register"
              location={location}
              setMenuOpen={setMenuOpen}
            />
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, label, location }) {
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
        active
          ? "bg-purple-600 text-white shadow-md"
          : "text-gray-700 hover:bg-purple-100 hover:text-purple-700"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, label, location, setMenuOpen }) {
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-3 rounded-lg transition-all ${
        active
          ? "bg-purple-600 text-white font-semibold shadow-md"
          : "text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium"
      }`}
    >
      {label}
    </Link>
  );
}
