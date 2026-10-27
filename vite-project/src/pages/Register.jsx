// src/pages/Register.jsx
import React, { useState, useRef, useEffect } from "react";
import { signup } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import FloatingNotes from "../components/FloatingNotes";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    role: "Vocalist",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
      );
    }
  }, []);

  function getRoleIcon(roleStr = "") {
    const lower = (roleStr || "").toLowerCase();
    if (lower.includes("vocal") || lower.includes("singer") || lower.includes("gayak")) return "🎤";
    if (lower.includes("mrudang") || lower.includes("mridang") || lower.includes("kanjira")) return "🥁";
    if (lower.includes("tabla") || lower.includes("pakhawaj")) return "🪘";
    if (lower.includes("violin")) return "🎻";
    if (lower.includes("flute") || lower.includes("venu") || lower.includes("bansuri")) return "🪈";
    if (lower.includes("harmon")) return "🎹";
    if (lower.includes("veena") || lower.includes("sitar") || lower.includes("tanpura") || lower.includes("sarod")) return "🪕";
    if (lower.includes("ghatam") || lower.includes("pot")) return "🏺";
    if (lower.includes("santoor") || lower.includes("swara")) return "🎼";
    return "🎵";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!form.name.trim() || !form.email.trim() || !form.username.trim() || !form.role.trim()) {
      setErrorMsg("Please fill in all required fields including your musical role / instrument.");
      return;
    }
    setLoading(true);
    try {
      const res = await signup(form);
      setSuccess(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const roleSuggestions = [
    { label: "Vocalist", icon: "🎤" },
    { label: "Mridangam", icon: "🥁" },
    { label: "Tabla", icon: "🪘" },
    { label: "Violinist", icon: "🎻" },
    { label: "Bansuri / Venu", icon: "🪈" },
    { label: "Veena", icon: "🪕" },
    { label: "Harmonium", icon: "🎹" },
    { label: "Ghatam", icon: "🏺" },
    { label: "Santoor", icon: "🎼" },
    { label: "Kanjira", icon: "🥁" },
  ];

  return (
    <div
      className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #090414 0%, #120726 40%, #1a0833 70%, #080318 100%)",
      }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.2) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <FloatingNotes count={14} />

      <div ref={cardRef} className="relative z-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-3xl mb-3 backdrop-blur-md bg-purple-500/10 border border-purple-500/20 shadow-xl">
            <span className="text-5xl block animate-bounce" style={{ animationDuration: "3s" }}>
              🎭
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #c084fc, #f472b6, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Artist Registration
          </h2>
          <p className="text-purple-300/70 text-sm font-medium">
            Join the premier Indian Classical & Fusion collective
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-medium text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl space-y-5"
          style={{
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>🆔</span> Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. skumar"
              className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>👤</span> Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Vidwan S. Kumar"
              className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>✉️</span> Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="kumar@mail.com"
              className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
              required
            />
          </div>

          {/* Custom Musical Role (Dropdown removed — User can add any custom role) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎵</span> Musical Role / Instrument
              </label>
              <span className="text-[10px] text-amber-300 font-semibold">
                Type your own or pick below
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                {getRoleIcon(form.role)}
              </span>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Carnatic Vocalist, Santoor, Ghatam, Sarangi..."
                required
                className="w-full rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-white placeholder-purple-300/40 focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(251,191,36,0.35)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(251,191,36,0.7)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(251,191,36,0.35)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {roleSuggestions.map((sug) => {
                const isSelected = form.role.toLowerCase() === sug.label.toLowerCase();
                return (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => setForm({ ...form, role: sug.label })}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, #fef08a, #f59e0b)"
                        : "rgba(255,255,255,0.06)",
                      color: isSelected ? "#451a03" : "rgba(255,255,255,0.75)",
                      border: isSelected
                        ? "1px solid #fbbf24"
                        : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isSelected ? "0 0 10px rgba(245,158,11,0.3)" : "none",
                    }}
                  >
                    {sug.icon} {sug.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Role preview badge */}
          {form.role.trim() && (
            <div
              className="p-3 rounded-xl flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(147,51,234,0.18))",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-purple-600/40 border border-amber-400/30">
                {getRoleIcon(form.role)}
              </div>
              <div>
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                  Registering as
                </div>
                <div className="text-sm font-bold text-white capitalize">
                  {form.role}
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>🔒</span> Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave empty to auto-generate"
              className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #9333ea, #ec4899)",
              boxShadow: "0 8px 24px rgba(147,51,234,0.4)",
            }}
          >
            {loading ? "⏳ Registering..." : "✨ Complete Registration"}
          </button>

          <p className="text-center text-xs text-purple-300/70 pt-2">
            Already registered?{" "}
            <Link to="/auth" className="text-pink-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>

        {/* Success Modal */}
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div
              className="backdrop-blur-2xl bg-[#13072b]/95 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white"
              style={{
                boxShadow: "0 25px 50px rgba(0,0,0,0.7), 0 0 40px rgba(147,51,234,0.3)",
              }}
            >
              <div className="text-4xl text-center mb-3">🎉</div>
              <h3
                className="text-2xl font-black text-center mb-2"
                style={{
                  background: "linear-gradient(135deg, #c084fc, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome to SwarSetu!
              </h3>
              <p className="text-xs text-purple-300/80 text-center mb-5">
                Your artist profile with role &quot;{form.role}&quot; has been created.
              </p>

              <div
                className="rounded-2xl p-4 space-y-2 mb-6"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(167,139,250,0.2)",
                }}
              >
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-purple-300">Artist ID</span>
                  <span className="font-mono font-bold text-white">{success.artist.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-purple-300">Role / Instrument</span>
                  <span className="font-bold text-amber-300">{form.role}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-purple-300">Username</span>
                  <span className="font-mono font-bold text-pink-300">{success.credentials.username}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-purple-300">Password</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {success.credentials.password || form.password || "(your chosen password)"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `username: ${success.credentials.username} | password: ${
                        success.credentials.password || form.password || ""
                      }`
                    );
                    alert("Credentials copied to clipboard!");
                  }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer"
                  style={{
                    background: "rgba(147,51,234,0.3)",
                    border: "1px solid rgba(167,139,250,0.4)",
                    color: "#e9d5ff",
                  }}
                >
                  📋 Copy Details
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #9333ea, #ec4899)",
                  }}
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
