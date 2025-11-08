import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import NotificationToast from "./components/NotificationToast";
import Home from "./pages/Home";
import Dashboard from "./pages/DashBoard";
import ScheduleConcert from "./pages/ScheduleConcert";
import RolePage from "./pages/RolePage";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Artists from "./pages/Artists";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <NotificationToast />
      <main className="pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
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
