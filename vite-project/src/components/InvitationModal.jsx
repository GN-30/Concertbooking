import React from "react";

export default function InvitationModal({ open, onClose, invite, onRespond }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500">Invitation</div>
            <div className="text-xl font-semibold mt-1">{invite?.title}</div>
            <div className="text-sm text-gray-600 mt-1">{invite?.details}</div>
          </div>
          <button className="text-gray-400" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => onRespond("rejected")}
            className="px-4 py-2 rounded-md border"
          >
            Decline
          </button>
          <button
            onClick={() => onRespond("accepted")}
            className="px-4 py-2 rounded-md bg-purple-700 text-white"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
