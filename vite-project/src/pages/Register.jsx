// src/pages/Register.jsx
import React, { useState } from "react";
import { registerArtist } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "vocal",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await registerArtist(form);
      alert("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const roleEmojis = {
    vocal: "🎤",
    mrudangist: "🥁",
    harmonist: "🎹",
    violinist: "🎻",
    flutist: "🎺",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-6xl animate-pulse">🎭</span>
          </div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Artist Registration
          </h2>
          <p className="text-gray-600">
            Join our community of talented musicians
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl p-8 rounded-2xl border border-purple-100 space-y-6"
        >
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="text-lg">👤</span>
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300 font-medium"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="text-lg">📧</span>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300 font-medium"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="text-lg">🎵</span>
              Select Your Role
            </label>
            <div className="relative">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300 appearance-none bg-white font-medium text-gray-800 cursor-pointer"
              >
                <option value="vocal">🎤 Vocal</option>
                <option value="mrudangist">🥁 Mrudangist</option>
                <option value="harmonist">🎹 Harmonist</option>
                <option value="violinist">🎻 Violinist</option>
                <option value="flutist">🎺 Flutist</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-purple-600">
                <svg
                  className="fill-current h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Selected Role Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl shadow-md">
                {roleEmojis[form.role]}
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  You're registering as
                </div>
                <div className="font-bold text-gray-800 capitalize">
                  {form.role}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Registering...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                ✨ Complete Registration
              </span>
            )}
          </button>

          {/* Footer Text */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Already registered?{" "}
            <a
              href="/dashboard"
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
