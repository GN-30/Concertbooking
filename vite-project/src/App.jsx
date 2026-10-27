import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import NotificationToast from "./components/NotificationToast";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import Home from "./pages/Home";
import Dashboard from "./pages/DashBoard";
import ScheduleConcert from "./pages/ScheduleConcert";
import RolePage from "./pages/RolePage";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Artists from "./pages/Artists";
import AuthPage from "./pages/auth";
import ArtistPublic from "./pages/ArtistPublic";
import auth from "./services/auth";

export default function App() {
  // Note: do not force-redirect to /auth so /register remains accessible
  return (
    <div className="min-h-screen" style={{ background: "#050010", color: "white" }}>
      <Header />
      <NotificationToast />
      <PwaInstallPrompt />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/artist/:id" element={<ArtistPublic />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<ScheduleConcert />} />
          <Route path="/role/:roleName" element={<RolePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/artists" element={<Artists />} />
        </Routes>
      </main>
    </div>
  );
}
