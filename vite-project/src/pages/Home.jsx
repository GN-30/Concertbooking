import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center flex-grow bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 text-white px-4 py-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Schedule Your Concert <br /> With{" "}
            <span className="text-purple-400">Ease</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-200 mb-8">
            Connect with vocalists, mrudangists, harmonists, and more — all in
            one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/schedule"
              className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full shadow-lg transition"
            >
              Schedule Concert
            </Link>
            <Link
              to="/dashboard"
              className="border border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-purple-700 transition"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-semibold text-lg text-gray-800">
            Schedule Concerts
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Select existing concerts and invite supporting artists for smooth
            coordination.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-semibold text-lg text-gray-800">
            Realtime Notifications
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Artists get instant notifications for invites, acceptance, and
            confirmations.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-semibold text-lg text-gray-800">
            Priority Management
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Assign priority to artists and automatically confirm your first
            preferences.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        © {new Date().getFullYear()} Elysian — Bringing Musicians Together
      </footer>
    </div>
  );
}
