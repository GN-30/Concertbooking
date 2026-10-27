// src/components/FloatingNotes.jsx
// Authentic Indian Classical Music Floating Elements
// Features: Saptaswaras (सा, रे, ग, म, प, ध, नि, ॐ) & Authentic Indian Instruments (Veena, Sitar, Tabla, Mridangam, Bansuri, Tanpura)
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Authentic Indian Classical Swaras & Symbols
const SWARAS = [
  { text: "सा", name: "Shadja", color: "#fcd34d" },
  { text: "रे", name: "Rishabha", color: "#f472b6" },
  { text: "ग", name: "Gandhara", color: "#c084fc" },
  { text: "म", name: "Madhyama", color: "#818cf8" },
  { text: "प", name: "Panchama", color: "#38bdf8" },
  { text: "ध", name: "Dhaivata", color: "#4ade80" },
  { text: "नि", name: "Nishada", color: "#fb923c" },
  { text: "ॐ", name: "Nada Brahma", color: "#fbbf24" },
  { text: "♫", name: "Swara", color: "#e879f9" },
  { text: "♬", name: "Taala", color: "#a78bfa" },
];

// Indian Instruments (Inline clean SVGs with glowing gold/violet tints)
const INDIAN_INSTRUMENTS_SVG = [
  // Bansuri / Flute with Peacock Feather
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
    <path d="M6 34 L56 16" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="18" cy="30" r="1.5" fill="#fef08a"/>
    <circle cx="26" cy="27" r="1.5" fill="#fef08a"/>
    <circle cx="34" cy="24" r="1.5" fill="#fef08a"/>
    <circle cx="42" cy="21" r="1.5" fill="#fef08a"/>
    <circle cx="50" cy="18" r="1.5" fill="#fef08a"/>
    <path d="M54 16 C57 10, 62 12, 59 18 C57 22, 53 19, 54 16 Z" fill="#38bdf8" opacity="0.8"/>
    <defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fbbf24"/></linearGradient></defs>
  </svg>`,
  
  // Tabla & Dagga (Twin Indian Drums)
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">
    <!-- Dagga (Left base drum) -->
    <ellipse cx="22" cy="32" rx="14" ry="10" fill="#2e1065" stroke="#c084fc" stroke-width="2"/>
    <ellipse cx="22" cy="32" rx="6" ry="4" fill="#030712"/>
    <path d="M8 32 C8 44, 36 44, 36 32" stroke="#a855f7" stroke-width="1.5" fill="rgba(147,51,234,0.2)"/>
    <!-- Dayan (Right treble drum) -->
    <ellipse cx="44" cy="28" rx="10" ry="7" fill="#3b0764" stroke="#f472b6" stroke-width="2"/>
    <ellipse cx="44" cy="28" rx="4" ry="3" fill="#030712"/>
    <path d="M34 28 C34 38, 54 38, 54 28" stroke="#ec4899" stroke-width="1.5" fill="rgba(236,72,153,0.2)"/>
  </svg>`,

  // Saraswati Veena / Sitar
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
    <!-- Resonator Gourd (Kudam) -->
    <circle cx="20" cy="44" r="12" fill="#451a03" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="20" cy="44" r="4" fill="#fbbf24" opacity="0.6"/>
    <!-- Stem (Dandi) -->
    <path d="M26 38 L50 14" stroke="#d97706" stroke-width="4" stroke-linecap="round"/>
    <path d="M28 36 L52 12" stroke="#fef08a" stroke-width="1"/>
    <!-- Upper Gourd & Dragon head (Yali) -->
    <circle cx="48" cy="18" r="5" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M50 14 Q56 8 58 12 Q56 16 52 16 Z" fill="#fbbf24"/>
  </svg>`,

  // Mridangam (Carnatic double-headed barrel drum)
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]">
    <!-- Barrel body -->
    <path d="M12 28 Q32 18 52 28 Q52 40 52 40 Q32 50 12 40 Z" fill="#3e1a06" stroke="#f59e0b" stroke-width="2"/>
    <!-- Left head -->
    <ellipse cx="12" cy="34" rx="4" ry="8" fill="#1f1105" stroke="#fbbf24" stroke-width="1.5"/>
    <ellipse cx="12" cy="34" rx="2" ry="4" fill="#000"/>
    <!-- Right head -->
    <ellipse cx="52" cy="34" rx="4" ry="8" fill="#1f1105" stroke="#fbbf24" stroke-width="1.5"/>
    <ellipse cx="52" cy="34" rx="2" ry="4" fill="#000"/>
    <!-- Leather braces -->
    <path d="M12 28 L52 40 M12 40 L52 28 M12 34 L52 34" stroke="#b45309" stroke-width="0.8" opacity="0.6"/>
  </svg>`,

  // Tanpura / Tambura (4-string drone lute)
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">
    <!-- Gourd resonator -->
    <ellipse cx="32" cy="48" rx="14" ry="11" fill="#3b0764" stroke="#c084fc" stroke-width="2"/>
    <circle cx="32" cy="48" r="4" fill="#e9d5ff" opacity="0.5"/>
    <!-- Long neck -->
    <path d="M32 37 L32 10" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/>
    <!-- Tuning Pegs -->
    <circle cx="28" cy="14" r="2" fill="#fbbf24"/>
    <circle cx="36" cy="14" r="2" fill="#fbbf24"/>
    <circle cx="28" cy="20" r="2" fill="#fbbf24"/>
    <circle cx="36" cy="20" r="2" fill="#fbbf24"/>
    <path d="M30 10 L34 10" stroke="#f59e0b" stroke-width="2"/>
  </svg>`
];

export default function FloatingNotes({ count = 18 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = [];

    for (let i = 0; i < count; i++) {
      const isInstrument = i % 3 === 0;
      const el = document.createElement("div");

      if (isInstrument) {
        // Indian Instrument SVG
        const svgContent =
          INDIAN_INSTRUMENTS_SVG[
            Math.floor(Math.random() * INDIAN_INSTRUMENTS_SVG.length)
          ];
        el.innerHTML = svgContent;
        const size = 32 + Math.random() * 26;
        el.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          opacity: 0;
          user-select: none;
          pointer-events: none;
          left: ${Math.random() * 92}%;
          top: ${Math.random() * 90}%;
          filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4));
        `;
      } else {
        // Indian Classical Swara (सा, रे, ग, म, प, ध, नि)
        const swara = SWARAS[Math.floor(Math.random() * SWARAS.length)];
        el.textContent = swara.text;
        const fontSize = 18 + Math.random() * 24;
        el.style.cssText = `
          position: absolute;
          font-size: ${fontSize}px;
          font-family: 'Outfit', 'Cinzel', serif;
          font-weight: 800;
          opacity: 0;
          user-select: none;
          pointer-events: none;
          left: ${Math.random() * 95}%;
          top: ${Math.random() * 92}%;
          color: ${swara.color};
          text-shadow: 0 0 14px ${swara.color};
        `;
      }

      container.appendChild(el);
      elements.push(el);

      const delay = Math.random() * 4;
      const duration = 5 + Math.random() * 6;

      gsap.to(el, {
        opacity: isInstrument ? 0.45 : 0.65,
        y: -(40 + Math.random() * 70),
        x: (Math.random() - 0.5) * 50,
        rotation: (Math.random() - 0.5) * 25,
        duration: duration,
        delay: delay,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        onRepeat: () => {
          gsap.set(el, {
            left: `${Math.random() * 94}%`,
            top: `${Math.random() * 92}%`,
          });
        },
      });
    }

    return () => {
      elements.forEach((el) => {
        gsap.killTweensOf(el);
        el.remove();
      });
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
