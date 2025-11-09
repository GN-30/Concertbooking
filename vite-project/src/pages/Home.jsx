import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Dynamic Background */}
      <section className="relative flex flex-col items-center justify-center text-center flex-grow overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950">
          {/* Animated Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 text-white px-4 py-32 max-w-5xl mx-auto">
          <div className="mb-8 inline-block">
            <span className="text-7xl animate-bounce">🎵</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
            Schedule Your Concert
            <br />
            With{" "}
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Ease
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-200 mb-12 font-normal leading-relaxed">
            Connect with vocalists, mrudangists, harmonists, and more — all in
            one place.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              to="/schedule"
              className="group bg-white text-purple-900 px-10 py-5 rounded-full shadow-2xl transition-all duration-300 font-bold text-lg hover:scale-110 hover:shadow-white/50 flex items-center gap-2"
            >
              Schedule Concert
              <span className="inline-block group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </Link>
            <Link
              to="/dashboard"
              className="group border-3 border-white/90 backdrop-blur-md bg-white/5 text-white px-10 py-5 rounded-full hover:bg-white hover:text-purple-900 transition-all duration-300 font-bold text-lg hover:scale-110 hover:shadow-2xl flex items-center gap-2"
            >
              View Dashboard
              <span className="inline-block group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-b from-white via-purple-50 to-white px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Why Choose SwarSetu?
          </h2>
          <p className="text-center text-gray-600 mb-16 text-xl font-medium">
            Everything you need to organize perfect concerts
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="group relative p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-purple-100 hover:border-purple-400 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <span className="text-4xl">📅</span>
                </div>
                <h3 className="font-black text-2xl text-gray-900 mb-4">
                  Schedule Concerts
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Select existing concerts and invite supporting artists for
                  smooth coordination.
                </p>
              </div>
            </div>

            <div className="group relative p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-purple-100 hover:border-pink-400 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <span className="text-4xl">🔔</span>
                </div>
                <h3 className="font-black text-2xl text-gray-900 mb-4">
                  Realtime Notifications
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Artists get instant notifications for invites, acceptance, and
                  confirmations.
                </p>
              </div>
            </div>

            <div className="group relative p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-purple-100 hover:border-purple-400 hover:-translate-y-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <span className="text-4xl">⭐</span>
                </div>
                <h3 className="font-black text-2xl text-gray-900 mb-4">
                  Priority Management
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Assign priority to artists and automatically confirm your
                  first preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-10 border-t border-purple-200 bg-gradient-to-r from-purple-50 via-white to-pink-50">
        <p className="font-semibold text-gray-700">
          © {new Date().getFullYear()}{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-black">
            Elysian
          </span>{" "}
          — Bringing Musicians Together
        </p>
      </footer>
    </div>
  );
}
