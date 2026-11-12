import React from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

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

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen app-container transition-colors duration-300">
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
    </ThemeProvider>
  );
}
