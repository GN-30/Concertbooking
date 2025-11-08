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

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Artist Registration
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg space-y-4"
      >
        <div>
          <label className="block text-sm text-gray-600">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2 mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded px-3 py-2 mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Select Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="vocal">Vocal</option>
            <option value="mrudangist">Mrudangist</option>
            <option value="harmonist">Harmonist</option>
            <option value="violinist">Violinist</option>
            <option value="flutist">Flutist</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-800"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
