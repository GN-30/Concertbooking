// src/components/PwaInstallPrompt.jsx
// SwarSetu Classical PWA Installation Popup & Toast
import React, { useState, useEffect } from "react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|crios|crmo|android/.test(userAgent);

    if (isAppleDevice && isSafari) {
      setIsIOS(true);
      // Check if user dismissed recently
      const dismissedTime = localStorage.getItem("pwa_ios_dismissed");
      const isRecentlyDismissed =
        dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 24 * 60 * 60 * 1000;
      if (!isRecentlyDismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 2500);
        return () => clearTimeout(timer);
      }
    }

    // 3. Standard PWA install prompt handler (Chrome, Edge, Android, Opera)
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if dismissed recently
      const dismissedTime = localStorage.getItem("pwa_prompt_dismissed");
      const isRecentlyDismissed =
        dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 12 * 60 * 60 * 1000;

      if (!isRecentlyDismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 2000);
        return () => clearTimeout(timer);
      } else {
        setMinimized(true);
      }
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log("🪕 SwarSetu PWA was successfully installed!");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowPrompt(true);
        setMinimized(false);
      }
      return;
    }

    // Trigger native browser install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA install prompt: ${outcome}`);

    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    } else {
      handleDismiss();
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    setMinimized(true);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
    if (isIOS) {
      localStorage.setItem("pwa_ios_dismissed", Date.now().toString());
    }
  }

  // If already running inside installed standalone app, do not display
  if (isInstalled) return null;

  return (
    <>
      {/* Minimized Quick Install Pill (always available if prompt is dismissed) */}
      {!showPrompt && (deferredPrompt || isIOS) && (
        <button
          onClick={() => {
            setShowPrompt(true);
            setMinimized(false);
          }}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full font-bold text-xs text-amber-950 transition-all hover:scale-105 cursor-pointer shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
            boxShadow: "0 8px 24px rgba(245, 158, 11, 0.4)",
            border: "1px solid rgba(254, 240, 138, 0.6)",
          }}
        >
          <span className="text-sm">📲</span>
          <span>Install SwarSetu App</span>
        </button>
      )}

      {/* Main Luxury PWA Install Popup */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{
            background: "rgba(5, 2, 16, 0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 relative overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-300"
            style={{
              background:
                "linear-gradient(145deg, rgba(28, 10, 48, 0.95) 0%, rgba(13, 3, 28, 0.98) 100%)",
              border: "1px solid rgba(251, 191, 36, 0.35)",
              boxShadow:
                "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.15)",
            }}
          >
            {/* Ambient gold glow */}
            <div
              className="absolute -top-20 -right-20 w-44 h-44 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-purple-300/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* App Header Badge */}
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(147, 51, 234, 0.35))",
                  border: "1.5px solid rgba(251, 191, 36, 0.45)",
                }}
              >
                🪕
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-lg font-black text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Install SwarSetu
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-300 uppercase tracking-wider"
                    style={{
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(251, 191, 36, 0.3)",
                    }}
                  >
                    PWA App
                  </span>
                </div>
                <p className="text-xs text-purple-200/70 mt-0.5">
                  Classical Concerts & Troupe Collaboration
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div
              className="p-3.5 rounded-2xl mb-5 space-y-2"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="flex items-center gap-2.5 text-xs text-purple-100">
                <span className="text-amber-400">⚡</span>
                <span>Fast, fullscreen native app experience without browser tabs</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-purple-100">
                <span className="text-amber-400">📅</span>
                <span>Instant concert invitations & troupe availability tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-purple-100">
                <span className="text-amber-400">📴</span>
                <span>Offline caching for festival schedules and artist profiles</span>
              </div>
            </div>

            {/* iOS specific instructions if on Safari */}
            {isIOS ? (
              <div
                className="p-3.5 rounded-2xl mb-4 text-xs space-y-1.5"
                style={{
                  background: "rgba(147, 51, 234, 0.15)",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                }}
              >
                <div className="font-bold text-amber-200">
                  📱 How to install on your iPhone / iPad:
                </div>
                <div className="text-purple-200/80">
                  1. Tap the <strong className="text-white">Share</strong> button (
                  <span className="text-sm">⎋</span>) at the bottom of Safari.
                </div>
                <div className="text-purple-200/80">
                  2. Scroll down and tap{" "}
                  <strong className="text-amber-300">Add to Home Screen ⊞</strong>.
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isIOS ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-amber-950 transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
                    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.35)",
                  }}
                >
                  <span>✨</span>
                  <span>Install Now</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-amber-950 transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
                  }}
                >
                  <span>Got It</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="py-3 px-4 rounded-xl font-bold text-xs text-purple-200/70 hover:text-white transition-colors cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
