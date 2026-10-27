// src/pages/ScheduleConcert.jsx
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getConcerts, createSession, getCurrentUser } from '../services/api';
import ArtistPicker from '../components/ArtistPicker';
import FloatingNotes from '../components/FloatingNotes';
import { useNavigate, useLocation } from 'react-router-dom';

const ROLE_EMOJIS = { vocal: '🎤', mrudangist: '🥁', harmonist: '🎹', violinist: '🎻', flutist: '🪈', tabla: '🪘', veena: '🪕' };

export default function ScheduleConcert() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [venue, setVenue] = useState('');
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    getConcerts().then(setConcerts);
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }

    const params = new URLSearchParams(location.search);
    const preDate = params.get('date');
    const artistId = params.get('artistId');
    const artistName = params.get('name');
    const artistRole = params.get('role');

    if (preDate) {
      setDateTime(`${preDate}T18:00`);
    }
    if (artistId) {
      const me = getCurrentUser();
      const isSelf = me && (
        me.id === artistId ||
        (me.email && artistId.toLowerCase() === me.email.toLowerCase()) ||
        (me.username && artistId.toLowerCase() === me.username.toLowerCase())
      );
      if (!isSelf) {
        setInvites((prev) => {
          if (prev.some((i) => i.user_id === artistId)) return prev;
          return [
            ...prev,
            {
              user_id: artistId,
              name: artistName || 'Invited Artist',
              role: artistRole || 'Classical Artist',
              priority: prev.length + 1,
            },
          ];
        });
      }
    }
  }, [location.search]);

  function addInvite(artist) {
    if (!artist) return;
    const me = currentUser || getCurrentUser();
    if (
      me &&
      (me.id === artist.id ||
        (me.email && artist.email && me.email.toLowerCase() === artist.email.toLowerCase()) ||
        (me.username && artist.username && me.username.toLowerCase() === artist.username.toLowerCase()))
    ) {
      alert('You cannot invite yourself as you are the organizer creating this concert schedule.');
      return;
    }
    if (invites.some((i) => i.user_id === artist.id)) return;
    setInvites((p) => [...p, { user_id: artist.id, name: artist.name, role: artist.role, priority: p.length + 1 }]);
  }
  function removeInvite(id) { setInvites((p) => p.filter((i) => i.user_id !== id)); }
  function setPriority(id, val) { setInvites((p) => p.map((i) => (i.user_id === id ? { ...i, priority: parseInt(val, 10) } : i))); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedConcert && !customTitle) return alert('Please select or specify a concert title');
    if (!venue.trim()) return alert('Please specify the concert venue or Sabha');
    if (!dateTime.trim()) return alert('Please choose an auspicious Date and Time');
    
    const me = currentUser || getCurrentUser();
    const cleanInvites = invites.filter((i) => {
      if (!me) return true;
      if (me.id && i.user_id === me.id) return false;
      return true;
    });

    if (!cleanInvites.length) return alert('Please invite at least one artist for the troupe');
    const concertObj = concerts.find((c) => c.id === selectedConcert);
    const finalTitle = customTitle.trim() || concertObj?.title || 'Classical Raga Katcheri';
    const payload = {
      concert_id: selectedConcert || `c_custom_${Date.now()}`,
      concert_title: finalTitle,
      date_time: dateTime,
      venue,
      invites: cleanInvites.map((i) => ({ user_id: i.user_id, name: i.name, role: i.role, priority: i.priority })),
    };
    setLoading(true);
    try {
      await createSession(payload);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error dispatching invitations');
    } finally {
      setLoading(false);
    }
  }

  const inputBase = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(251,191,36,0.25)',
    borderRadius: '14px',
    color: 'white',
    padding: '12px 16px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#fde68a',
    marginBottom: '8px',
  };

  function focusIn(e) { e.target.style.borderColor = 'rgba(251,191,36,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'; }
  function focusOut(e) { e.target.style.borderColor = 'rgba(251,191,36,0.25)'; e.target.style.boxShadow = 'none'; }

  return (
    <div className="page-wrapper">
      <div className="orb-gold" style={{ width: 550, height: 550, top: '-150px', right: '10%' }} />
      <div className="orb-violet" style={{ width: 480, height: 480, bottom: '5%', left: '-60px' }} />
      <FloatingNotes count={12} />

      <div ref={containerRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="badge-pill mx-auto mb-5">✦ Sangeeta Katcheri Orchestrator ✦</div>
          <h1
            className="font-black tracking-tight mb-3"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2rem, 5vw, 4rem)', background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 45%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Schedule a Classical Concert
          </h1>
          <div className="section-divider mb-4" />
          <p className="text-purple-300/65 text-sm max-w-lg mx-auto">
            Design your ensemble, set the auspicious muhurtham, and dispatch invitations to classical maestros.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Column 1 */}
            <div className="card-luxury p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}
                >
                  🪕
                </div>
                <div>
                  <h3 className="font-black text-amber-200" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px' }}>Concert & Sabha Details</h3>
                  <p className="text-[11px] text-purple-300/55 mt-0.5">Step 1 — Define the theme, venue & muhurtham</p>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Select Festival / Repertoire</label>
                <select value={selectedConcert} onChange={(e) => setSelectedConcert(e.target.value)}
                  style={{ ...inputBase, background: '#0f0520', cursor: 'pointer' }}
                  onFocus={focusIn} onBlur={focusOut}
                >
                  <option value="">-- Choose from Festival Repertoire --</option>
                  {concerts.map((c) => (<option key={c.id} value={c.id}>{c.title} ({c.venue})</option>))}
                </select>
              </div>

              <div>
                <label style={{ ...labelStyle, color: '#c084fc' }}>Or Custom Concert Title</label>
                <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Tyagaraja Aradhana Grand Katcheri"
                  style={inputBase} onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>🕐 Auspicious Date & Time (Muhurtham)</label>
                <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)}
                  required style={inputBase} onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              <div>
                <label style={labelStyle}>📍 Sabha / Auditorium Venue</label>
                <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. The Music Academy, Chennai"
                  required style={inputBase} onFocus={focusIn} onBlur={focusOut}
                />
              </div>

              <div
                className="mt-auto p-4 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(147,51,234,0.1))', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                <div className="text-[9px] font-bold text-amber-300 uppercase tracking-wider mb-2">Invitation Preview</div>
                <div className="text-sm font-black text-white truncate">
                  {customTitle || concerts.find((c) => c.id === selectedConcert)?.title || 'Classical Performance'}
                </div>
                <div className="text-xs text-purple-200/70 mt-1">📍 {venue || 'Venue TBA'}</div>
                <div className="text-xs text-amber-300 font-mono mt-0.5">
                  🕐 {dateTime ? new Date(dateTime).toLocaleString() : 'Date TBC'}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="card-luxury p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(192,132,252,0.25)' }}
                >
                  🎻
                </div>
                <div>
                  <h3 className="font-black text-amber-200" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px' }}>Assemble the Troupe</h3>
                  <p className="text-[11px] text-purple-300/55 mt-0.5">Step 2 — Search & invite vocalists, percussionists</p>
                </div>
              </div>

              {/* Organizer / Sender indicator */}
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                }}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    Concert Orchestrator (Sender)
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {currentUser?.name || 'Sabha Organizer'}
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-200 capitalize"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(251,191,36,0.25)',
                  }}
                >
                  {currentUser?.role || 'Organizer'} (You)
                </span>
              </div>

              <div>
                <label style={labelStyle}>Search & Add Artists (Troupe Members)</label>
                <ArtistPicker onAdd={addInvite} excludeUserId={currentUser?.id} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Invited Ensemble ({invites.length})</span>
                  {invites.length > 0 && <span className="text-[10px] text-purple-300/55">P1 = First Choice</span>}
                </div>

                {invites.length === 0 ? (
                  <div
                    className="text-center py-10 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)' }}
                  >
                    <div className="text-4xl mb-2">🪈</div>
                    <p className="text-xs text-purple-200/55 font-medium">No artists added yet</p>
                    <p className="text-[11px] text-purple-300/35 mt-1">Search above to add to your troupe</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-auto pr-1">
                    {invites.map((inv) => {
                      const emoji = ROLE_EMOJIS[(inv.role || '').toLowerCase()] || '🪕';
                      return (
                        <div
                          key={inv.user_id}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(251,191,36,0.18)' }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{emoji}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{inv.name}</div>
                              <div className="text-[10px] text-amber-300 capitalize">{inv.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={inv.priority}
                              onChange={(e) => setPriority(inv.user_id, e.target.value)}
                              className="text-[10px] font-bold rounded-lg px-2 py-1 text-amber-200 cursor-pointer focus:outline-none"
                              style={{ background: '#0f0520', border: '1px solid rgba(251,191,36,0.3)' }}
                            >
                              <option value={1}>P1</option>
                              <option value={2}>P2</option>
                              <option value={3}>P3</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeInvite(inv.user_id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-red-300 transition-colors"
                              style={{ background: 'rgba(239,68,68,0.1)' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full"
                  style={{ borderRadius: '16px', padding: '16px', fontSize: '14px', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? (
                    <span>⏳ Dispatching Invitations...</span>
                  ) : (
                    <>
                      <span>🚀 Dispatch Troupe Invitations</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
