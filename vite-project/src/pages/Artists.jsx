// src/pages/Artists.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getAllArtists } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import FloatingNotes from '../components/FloatingNotes';

const ROLE_EMOJIS = {
  vocal: '🎤',
  mrudangist: '🥁',
  tabla: '🪘',
  harmonist: '🎹',
  violinist: '🎻',
  flutist: '🪈',
  veena: '🪕',
};

const ROLE_LABELS = {
  vocal: 'Vocal',
  mrudangist: 'Mridangam',
  tabla: 'Tabla',
  harmonist: 'Harmonium',
  violinist: 'Violin',
  flutist: 'Venu/Bansuri',
  veena: 'Veena/Sitar',
};

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
    getAllArtists().then((list) => {
      setArtists(list);
      requestAnimationFrame(() => {
        if (gridRef.current && gridRef.current.children.length) {
          gsap.fromTo(
            Array.from(gridRef.current.children),
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: 'power2.out' }
          );
        }
      });
    });
  }, []);

  // Compute dynamic roles with counts from the loaded artists list
  const dynamicRoles = useMemo(() => {
    const counts = new Map();
    artists.forEach((a) => {
      const r = (a.role || 'other').toLowerCase();
      counts.set(r, (counts.get(r) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([key, count]) => ({
      key,
      label: ROLE_LABELS[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
      emoji: ROLE_EMOJIS[key] || '🪕',
      count,
    }));
  }, [artists]);

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      const nameMatch = a.name?.toLowerCase().includes(search.toLowerCase());
      const emailMatch = a.email?.toLowerCase().includes(search.toLowerCase());
      const matchSearch = !search || nameMatch || emailMatch;
      const matchRole = roleFilter === 'all' || (a.role || '').toLowerCase() === roleFilter.toLowerCase();
      return matchSearch && matchRole;
    });
  }, [artists, search, roleFilter]);

  return (
    <div className="page-wrapper">
      {/* Ambient orbs */}
      <div className="orb-gold" style={{ width: 600, height: 600, top: 0, left: '20%' }} />
      <div className="orb-violet" style={{ width: 500, height: 500, bottom: '10%', right: '5%' }} />
      <FloatingNotes count={12} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Page Header */}
        <div ref={headerRef} className="text-center mb-10">
          <div className="badge-pill mx-auto mb-5">✦ Vidwan &amp; Vidushi Ensemble ✦</div>
          <h1
            className="font-black tracking-tight mb-4"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 45%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Classical Artists &amp; Maestros
          </h1>
          <div className="section-divider mb-5" />
          <p className="text-purple-300/65 text-sm max-w-lg mx-auto">
            Discover verified vocalists, mridangists, sitarists, and classical accompanists for your concert troupe.
          </p>
        </div>

        {/* Search Bar (Dropdown removed — completely dynamic) */}
        <div className="max-w-2xl mx-auto mb-6">
          <div
            className="relative flex items-center p-2 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <svg
              width="18"
              height="18"
              style={{ width: '18px', height: '18px' }}
              className="absolute left-5 text-amber-400/80 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search maestro by name, email, or style..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent pl-12 pr-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="px-3 py-1 text-xs font-semibold text-purple-300/60 hover:text-white"
              >
                ✕ Clear
              </button>
            )}
            <div
              className="text-[11px] font-bold text-amber-300/80 px-3 py-1.5 rounded-xl flex-shrink-0 mr-1"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              {filtered.length} {filtered.length === 1 ? 'Maestro' : 'Maestros'}
            </div>
          </div>
        </div>

        {/* Dynamic Role Filter Pills (Populated directly from available artists) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
            style={{
              background: roleFilter === 'all'
                ? 'linear-gradient(135deg, #fef08a, #f59e0b)'
                : 'rgba(255,255,255,0.05)',
              color: roleFilter === 'all' ? '#451a03' : 'rgba(255,255,255,0.75)',
              border: roleFilter === 'all'
                ? '1px solid #fbbf24'
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: roleFilter === 'all' ? '0 0 16px rgba(245,158,11,0.35)' : 'none',
              transform: roleFilter === 'all' ? 'scale(1.04)' : 'none',
            }}
          >
            ✦ All Troupe ({artists.length})
          </button>
          {dynamicRoles.map(({ key, label, emoji, count }) => {
            const active = roleFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setRoleFilter(active ? 'all' : key)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, #fef08a, #f59e0b)'
                    : 'rgba(255,255,255,0.05)',
                  color: active ? '#451a03' : 'rgba(255,255,255,0.75)',
                  border: active
                    ? '1px solid #fbbf24'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: active ? '0 0 16px rgba(245,158,11,0.35)' : 'none',
                  transform: active ? 'scale(1.04)' : 'none',
                }}
              >
                <span>{emoji}</span>
                <span>{label}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(69,26,3,0.2)' : 'rgba(255,255,255,0.1)',
                    color: active ? '#451a03' : 'rgba(255,255,255,0.7)',
                    fontWeight: '800',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Artists Grid */}
        {filtered.length > 0 ? (
          <div ref={gridRef} className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((artist) => {
              const roleKey = (artist.role || 'vocal').toLowerCase();
              const emoji = ROLE_EMOJIS[roleKey] || '🪕';
              const roleLabel = ROLE_LABELS[roleKey] || artist.role;

              return (
                <div
                  key={artist.id}
                  onClick={() => navigate(`/artist/${artist.id}`)}
                  className="card-luxury group p-6 text-center cursor-pointer relative overflow-hidden"
                >
                  {/* Hover gold glow */}
                  <div
                    className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 70%)' }}
                  />

                  <div className="relative z-10">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(147,51,234,0.25))',
                          border: '1px solid rgba(251,191,36,0.25)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                        }}
                      >
                        {emoji}
                      </div>
                      <div
                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-amber-200"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #d97706)',
                          border: '2px solid rgba(5,2,14,0.8)',
                        }}
                      >
                        {artist.name?.[0] || 'M'}
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-300 transition-colors duration-250">
                      {artist.name}
                    </h3>

                    {/* Dynamic Role pill */}
                    <div className="mb-3">
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide"
                        style={{
                          background: 'rgba(245,158,11,0.12)',
                          border: '1px solid rgba(251,191,36,0.25)',
                          color: '#fde68a',
                        }}
                      >
                        {emoji} {roleLabel}
                      </span>
                    </div>

                    {/* Email */}
                    <p className="text-[11px] text-purple-300/50 mb-5 truncate font-mono">{artist.email}</p>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(`/artist/${artist.id}`); }}
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-250 text-amber-950"
                      style={{
                        background: 'linear-gradient(135deg, #fef08a, #f59e0b)',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-28">
            <div className="text-6xl mb-4">🪕</div>
            <h3 className="text-white font-bold text-lg mb-2">No Artists Found</h3>
            <p className="text-purple-300/60 text-sm">
              {roleFilter !== 'all' ? `No ${ROLE_LABELS[roleFilter] || roleFilter} artists matching "${search}"` : 'Try adjusting your search criteria.'}
            </p>
            <button
              onClick={() => { setSearch(''); setRoleFilter('all'); }}
              className="btn-glass mt-6"
              style={{ padding: '10px 24px', fontSize: '12px' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
