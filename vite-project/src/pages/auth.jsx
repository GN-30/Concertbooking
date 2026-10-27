// src/pages/auth.jsx
// Royal Classical Login Page
import React, { useState, useRef, useEffect } from "react";
import { login } from "../services/auth";
import { loginArtist } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import FloatingNotes from "../components/FloatingNotes";

export default function AuthPage() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
      );
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      try {
        await loginArtist({ email: form.identifier, password: form.password });
      } catch {
        await login(form.identifier, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      if (cardRef.current) {
        gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        gsap.to(cardRef.current, { x: 8, duration: 0.08, yoyo: true, repeat: 4 });
      }
      setErrorMsg(err.message || "Invalid credentials. Please verify your email/username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #15082e 0%, #0c041c 45%, #05020c 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <FloatingNotes count={14} />

      <div ref={cardRef} className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-4xl shadow-xl bg-amber-400/[0.08] border border-amber-400/20">
            🪕
          </div>
          <h2
            className="text-4xl font-black mb-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 45%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Maestro Sign In
          </h2>
          <p className="text-purple-300/70 text-xs sm:text-sm">
            Access your classical concert schedule and sabha invitations
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-medium text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="p-8 rounded-3xl backdrop-blur-2xl bg-white/[0.04] border border-white/[0.09] space-y-5"
          style={{
            boxShadow:
              "0 20px 50px -15px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
              📧 Email or Username
            </label>
            <input
              type="text"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              placeholder="e.g. kumar@mail.com or skumar"
              required
              className="w-full rounded-2xl px-4 py-3 text-xs font-medium text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
              🔒 Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
              className="w-full rounded-2xl px-4 py-3 text-xs font-medium text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-black text-xs tracking-wider uppercase text-amber-950 transition-all duration-300 hover:scale-[1.02] shadow-xl disabled:opacity-50 mt-2"
            style={{
              background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
              boxShadow: "0 10px 25px rgba(245, 158, 11, 0.35)",
            }}
          >
            {loading ? "Signing In..." : "Enter Sabha Dashboard →"}
          </button>

          <p className="text-center text-xs text-purple-300/60 pt-2">
            New maestro?{" "}
            <Link to="/register" className="text-amber-300 font-bold hover:underline">
              Register as Classical Artist
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
