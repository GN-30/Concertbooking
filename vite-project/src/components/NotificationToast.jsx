import React, { useEffect, useState } from "react";
import socket from "../services/socket";

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // connect socket (autoConnect=false in socket.js; connect here if needed)
    if (!socket.connected) socket.connect();

    const onInvite = (payload) => {
      setToasts((prev) => [
        {
          id: Date.now(),
          title: payload.title || "New Invite",
          body: payload.body || "",
          payload,
        },
        ...prev,
      ]);
    };

    socket.on("invite_created", onInvite);

    return () => {
      socket.off("invite_created", onInvite);
    };
  }, []);

  useEffect(() => {
    if (toasts.length) {
      const timer = setTimeout(() => setToasts((t) => t.slice(0, 2)), 6000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-16 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="max-w-sm bg-white shadow-lg rounded-lg p-3 border"
        >
          <div className="flex items-start gap-2">
            <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center font-semibold">
              🎵
            </div>
            <div className="flex-1">
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs text-gray-600">{t.body}</div>
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="text-sm text-gray-400"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
