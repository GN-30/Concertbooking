// src/services/auth.js
// Lightweight auth helpers using localStorage + api.js
import { registerArtist, setCurrentUser, getAllArtists, loginArtist } from "./api";

async function hashPassword(password) {
  if (!password) return "";
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signup({ name, email, role, username, password }) {
  const all = await getAllArtists();
  if (all.find((a) => a.email === email)) throw new Error("Email already registered");
  if (username && all.find((a) => a.username === username)) throw new Error("Username already taken");

  // If no username provided, generate a short unique one
  const genUsername = username || `user_${Math.random().toString(36).slice(2, 8)}`;

  // If no password provided, generate one and return it to the caller
  const generatedPassword = password && password.length > 0 ? null : Math.random().toString(36).slice(2, 10);
  const rawPassword = password && password.length > 0 ? password : generatedPassword;

  // Save artist with password
  const newArtist = await registerArtist({
    name,
    email,
    role,
    username: genUsername,
    password: rawPassword,
  });

  // set current user
  setCurrentUser(email);

  return { artist: newArtist, credentials: { username: genUsername, password: generatedPassword || rawPassword } };
}

export async function login(identifier, password) {
  return await loginArtist({ identifier, password });
}

export function logout() {
  setCurrentUser("");
}

export function isAuthenticated() {
  return !!localStorage.getItem("currentUserEmail");
}

export default { signup, login, logout, isAuthenticated };
