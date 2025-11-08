import React from "react";

export default function ConcertCard({ concert, onAccept }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border">
      <div className="flex items-start gap-4">
        <img
          src={concert.image || "/card-artist.jpg"}
          alt=""
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="text-sm text-gray-500">
            {new Date(concert.date_time).toLocaleString()}
          </div>
          <div className="font-semibold text-lg">{concert.title}</div>
          <div className="text-sm text-gray-600 mt-1">
            {concert.venue || "Unknown venue"}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onAccept(concert)}
              className="px-3 py-1 rounded-full bg-green-600 text-white text-sm"
            >
              Accept
            </button>
            <button className="px-3 py-1 rounded-full border text-sm">
              Decline
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Priority: {concert.priority ?? "—"}
        </div>
      </div>
    </div>
  );
}
