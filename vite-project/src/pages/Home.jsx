import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center flex-grow bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/50 to-pink-900/60"></div>

        <div className="relative z-10 text-white px-4 py-32">
          <div className="mb-6 inline-block">
            <span className="text-6xl animate-pulse">🎵</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
            Schedule Your Concert <br /> With{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ease
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-100 mb-10 font-light">
            Connect with vocalists, mrudangists, harmonists, and more — all in
            one place.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/schedule"
              className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-full shadow-2xl transition-all duration-300 font-semibold text-lg hover:scale-105 hover:shadow-purple-500/50"
            >
              Schedule Concert
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <Link
              to="/dashboard"
              className="group border-2 border-white/80 backdrop-blur-sm bg-white/10 text-white px-8 py-4 rounded-full hover:bg-white hover:text-purple-700 transition-all duration-300 font-semibold text-lg hover:scale-105 hover:shadow-2xl"
            >
              View Dashboard
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Why Choose SwarSetu?
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Everything you need to organize perfect concerts
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-3">
              Schedule Concerts
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Select existing concerts and invite supporting artists for smooth
              coordination.
            </p>
          </div>

          <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🔔</span>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-3">
              Realtime Notifications
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Artists get instant notifications for invites, acceptance, and
              confirmations.
            </p>
          </div>

          <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-3">
              Priority Management
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Assign priority to artists and automatically confirm your first
              preferences.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-8 border-t border-purple-100 bg-gradient-to-r from-purple-50 via-white to-pink-50">
        <p className="font-medium">
          © {new Date().getFullYear()}{" "}
          <span className="text-purple-600 font-semibold">Elysian</span> —
          Bringing Musicians Together
        </p>
      </footer>
    </div>
  );
}
