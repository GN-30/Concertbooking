import React, { useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "GN Srihari Narayanan",
    email: "you@example.com",
    roles: ["main", "vocal"],
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
            GN
          </div>
          <div>
            <div className="font-semibold">{profile.name}</div>
            <div className="text-sm text-gray-500">{profile.email}</div>
            <div className="text-sm mt-2">
              Roles: {profile.roles.join(", ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
