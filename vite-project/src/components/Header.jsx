// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import auth from '../services/auth';
import { getCurrentUser, setCurrentUserObj } from '../services/api';
import CalendarPrivacyModal from './CalendarPrivacyModal';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/schedule', label: 'Schedule', icon: '📅' },
  { to: '/artists', label: 'Artists', icon: '🎵' },
];

export default function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const { isLight, toggleTheme } = useTheme();

  useEffect(() => {
    setUser(getCurrentUser());
    function onUserChange() { setUser(getCurrentUser()); }
    window.addEventListener('swarsethu:userChanged', onUserChange);
    return () => window.removeEventListener('swarsethu:userChanged', onUserChange);
  }, [location.pathname]);

  const handlePrivacySaved = (updatedUser) => {
    setUser(updatedUser);
    setCurrentUserObj(updatedUser);
  };

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <>
    <header
      ref={headerRef}
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(5,2,14,0.92)' : 'rgba(5,2,14,0.65)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: scrolled
          ? '1px solid rgba(245,158,11,0.18)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: scrolled
          ? '0 8px 32px -8px rgba(0,0,0,0.8), 0 1px 0 rgba(245,158,11,0.12)'
          : 'none',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 30%, rgba(192,132,252,0.5) 70%, transparent 100%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div
              className="relative rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{
                width: '42px',
                height: '42px',
                minWidth: '42px',
                minHeight: '42px',
                maxWidth: '42px',
                maxHeight: '42px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #d97706 0%, #7c3aed 100%)',
                boxShadow: '0 0 18px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {/* Indian Saraswati Veena / Sitar Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 64 64"
                fill="none"
                style={{ width: '24px', height: '24px', display: 'block' }}
              >
                <circle cx="20" cy="44" r="13" fill="#451a03" stroke="#fbbf24" strokeWidth="2.5"/>
                <circle cx="20" cy="44" r="4.5" fill="#fbbf24"/>
                <path d="M26 38 L52 12" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"/>
                <path d="M28 36 L54 10" stroke="#fef08a" strokeWidth="1.2"/>
                <circle cx="50" cy="16" r="5" fill="#78350f" stroke="#fbbf24" strokeWidth="2"/>
                <path d="M52 12 Q58 6 60 10 Q58 14 54 14 Z" fill="#fbbf24"/>
              </svg>
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-xl font-black tracking-tight"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 45%, #e879f9 85%, #c084fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  SwarSetu
                </span>
                <span className="text-amber-400/70 text-[11px] font-semibold hidden sm:inline">स्वरसेतु</span>
              </div>
              <p className="text-[9px] tracking-[0.16em] uppercase font-semibold text-purple-300/50">
                Classical Concert Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <div
              className="flex items-center gap-1 p-1 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
                    style={
                      active
                        ? {
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(147,51,234,0.25))',
                            color: '#fef08a',
                            border: '1px solid rgba(251,191,36,0.3)',
                            boxShadow: '0 0 16px rgba(245,158,11,0.15)',
                          }
                        : { color: 'rgba(203,213,225,0.7)', border: '1px solid transparent' }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'rgba(203,213,225,0.7)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
                        style={{ boxShadow: '0 0 6px #fbbf24' }}
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Privacy Button with dynamic live policy status */}
            {user && (() => {
              const isPrivate = user.calendar_visibility === "private";
              const isPartial = user.calendar_visibility === "blacklist" || user.calendar_visibility === "whitelist";
              const statusLabel = isPrivate ? "Private" : isPartial ? "Partial" : "Public";
              const badgeColor = isPrivate ? "#f43f5e" : isPartial ? "#c084fc" : "#10b981";
              const bgStyle = isPrivate
                ? "rgba(244,63,94,0.14)"
                : isPartial
                ? "rgba(168,85,247,0.14)"
                : "rgba(16,185,129,0.14)";
              const borderStyle = isPrivate
                ? "1px solid rgba(244,63,94,0.35)"
                : isPartial
                ? "1px solid rgba(168,85,247,0.35)"
                : "1px solid rgba(16,185,129,0.35)";

              return (
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 cursor-pointer whitespace-nowrap shadow-sm"
                  style={{
                    background: bgStyle,
                    border: borderStyle,
                    color: "#fff",
                  }}
                  title={`Calendar Privacy is currently ${statusLabel}. Click to change policy.`}
                >
                  <span className="text-sm">🛡️</span>
                  <span>Privacy</span>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-0.5"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      color: badgeColor,
                      border: `1px solid ${badgeColor}33`,
                    }}
                  >
                    {statusLabel}
                  </span>
                </button>
              );
            })()}

            {/* Theme Toggle Button — Desktop */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 hover:scale-110 cursor-pointer flex-shrink-0"
              style={{
                background: isLight ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                border: isLight ? '1px solid rgba(217,119,6,0.4)' : '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <span className="text-base">{isLight ? '🌙' : '☀️'}</span>
            </button>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-right leading-tight">
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[10px] font-semibold text-amber-300 capitalize tracking-wider">{user.role || 'Maestro'}</div>
                </div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-amber-100 border border-amber-400/25"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #d97706)' }}
                >
                  {user.name?.[0] || 'M'}
                </div>
                <button
                  onClick={() => { auth.logout(); navigate('/auth'); }}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-purple-300/50 hover:text-red-400 transition-colors"
                  style={{ background: 'rgba(239,68,68,0.06)' }}
                >
                  <svg width="16" height="16" style={{ width: '16px', height: '16px' }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="px-4 py-2 text-xs font-semibold text-purple-200/80 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-gold"
                  style={{ padding: '10px 20px', fontSize: '12px', borderRadius: '12px' }}
                >
                  Join Free ✦
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-300"
            style={{
              background: menuOpen ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(245,158,11,0.25)',
            }}
            aria-label="Toggle menu"
          >
            <span
              className="w-5 h-0.5 rounded-full bg-amber-400 transition-all duration-300 origin-center"
              style={{ transform: menuOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none' }}
            />
            <span
              className="w-5 h-0.5 rounded-full bg-amber-400 transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="w-5 h-0.5 rounded-full bg-amber-400 transition-all duration-300 origin-center"
              style={{ transform: menuOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none' }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: menuOpen ? '400px' : '0', opacity: menuOpen ? 1 : 0 }}
      >
        <div
          className="px-4 pt-2 pb-6 space-y-1"
          style={{ background: 'rgba(5,2,14,0.97)', borderTop: '1px solid rgba(245,158,11,0.12)' }}
        >
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(147,51,234,0.22))',
                        color: '#fef08a',
                        border: '1px solid rgba(251,191,36,0.25)',
                      }
                    : { color: 'rgba(203,213,225,0.75)', border: '1px solid transparent' }
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" style={{ boxShadow: '0 0 6px #fbbf24' }} />}
              </Link>
            );
          })}

          <div className="divider-line my-3" />

          {user ? (
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-amber-100"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #d97706)' }}
                >
                  {user.name?.[0] || 'M'}
                </div>
                <div>
                  <div className="text-white text-xs font-bold">{user.name}</div>
                  <div className="text-amber-300 text-[10px] capitalize">{user.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Privacy Button with status */}
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setPrivacyOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                  style={{
                    background:
                      user.calendar_visibility === "private"
                        ? "rgba(244,63,94,0.18)"
                        : user.calendar_visibility === "blacklist" || user.calendar_visibility === "whitelist"
                        ? "rgba(168,85,247,0.18)"
                        : "rgba(16,185,129,0.18)",
                    border:
                      user.calendar_visibility === "private"
                        ? "1px solid rgba(244,63,94,0.4)"
                        : user.calendar_visibility === "blacklist" || user.calendar_visibility === "whitelist"
                        ? "1px solid rgba(168,85,247,0.4)"
                        : "1px solid rgba(16,185,129,0.4)",
                    color: "#fff",
                  }}
                >
                  <span>🛡️</span>
                  <span>
                    Privacy:{" "}
                    {user.calendar_visibility === "private"
                      ? "Private"
                      : user.calendar_visibility === "blacklist" || user.calendar_visibility === "whitelist"
                      ? "Partial"
                      : "Public"}
                  </span>
                </button>
                <button
                  onClick={() => { auth.logout(); navigate('/auth'); setMenuOpen(false); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-300"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  Sign Out
                </button>
                {/* Theme Toggle Button — Mobile */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={isLight ? 'Switch to Dark' : 'Switch to Light'}
                  className="flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 flex-shrink-0"
                  style={{
                    background: isLight ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                    border: isLight ? '1px solid rgba(217,119,6,0.4)' : '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <span className="text-sm">{isLight ? '🌙' : '☀️'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-3 rounded-xl text-center text-xs font-semibold text-purple-200"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-3 rounded-xl text-center text-xs font-bold text-amber-950"
                style={{ background: 'linear-gradient(135deg, #fde047, #f59e0b)' }}
              >
                Join Free ✦
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>

      {/* Calendar Privacy Modal */}
      {user && (
        <CalendarPrivacyModal
          isOpen={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
          currentUser={user}
          onSaved={handlePrivacySaved}
        />
      )}
    </>
  );
}
