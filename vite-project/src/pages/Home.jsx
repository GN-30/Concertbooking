// src/pages/Home.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import * as THREE from 'three';
import FloatingNotes from '../components/FloatingNotes';

const INSTRUMENTS = [
  { name: 'Carnatic Vocal', role: 'Pradhana Gayak', icon: '🎤', badge: 'Melodic Lead', desc: 'Soul of the concert — weaving ragas with emotion, bhava, and intricate improvisations.' },
  { name: 'Mridangam', role: 'Laya Vidwan', icon: '🥁', badge: 'Laya & Tala', desc: 'The king of Carnatic percussion, anchoring complex Tala cycles and korvai patterns.' },
  { name: 'Tabla & Dagga', role: 'Tabla Maestro', icon: '🪘', badge: 'Rhythm & Bol', desc: 'Dynamic Hindustani rhythmic counterpart with intricate bols, lehras, and tihais.' },
  { name: 'Saraswati Veena', role: 'Veena Vidushi', icon: '🪕', badge: 'Sacred Strings', desc: 'Sacred acoustic strings evoking pure classical divinity and microtonal shrutis.' },
  { name: 'Venu & Bansuri', role: 'Vanshika Flutist', icon: '🪈', badge: 'Wind & Melody', desc: 'Bamboo flute crafting soulful alapanas and resonant spiritual swaras from the heart.' },
  { name: 'Sitar', role: 'Sitarist', icon: '🎸', badge: 'String Maestro', desc: 'The iconic plucked string instrument of Hindustani classical music with 21 strings.' },
];

const STATS = [
  { num: '500+', label: 'Classical Maestros', icon: '🎻' },
  { num: '1,200+', label: 'Ragas Scheduled', icon: '🪕' },
  { num: '72', label: 'Melakarta Ragas', icon: '🪈' },
  { num: '100%', label: 'Conflict-Free', icon: '✦' },
];

export default function Home() {
  const canvasRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const mount = canvasRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060210, 0.04);
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 8;
    camera.position.y = 1;
    const renderer = new THREE.WebGLRenderer({ canvas: mount, alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const rings = [];
    for (let r = 0; r < 6; r++) {
      const radius = 1.8 + r * 1.0;
      const geo = new THREE.RingGeometry(radius, radius + 0.018, 80);
      const mat = new THREE.MeshBasicMaterial({ color: r % 2 === 0 ? 0xf59e0b : 0xa855f7, transparent: true, opacity: 0.2 - r * 0.025, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.PI / 2.2;
      mesh.position.y = -1;
      scene.add(mesh);
      rings.push({ mesh, speed: 0.002 + r * 0.0008 });
    }

    const pCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const pOrigY = new Float32Array(pCount);
    const gold = new THREE.Color(0xfbbf24);
    const violet = new THREE.Color(0xc084fc);
    for (let i = 0; i < pCount; i++) {
      const x = (Math.random() - 0.5) * 24, y = (Math.random() - 0.5) * 14, z = (Math.random() - 0.5) * 16 - 2;
      pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
      pOrigY[i] = y;
      const c = Math.random() > 0.45 ? gold : violet;
      pColors[i * 3] = c.r; pColors[i * 3 + 1] = c.g; pColors[i * 3 + 2] = c.b;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(pGeo, pMat));

    let mouseX = 0, mouseY = 0;
    const onMM = (e) => { mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35; mouseY = (e.clientY / window.innerHeight - 0.5) * 0.25; };
    window.addEventListener('mousemove', onMM);
    let frameId;
    const clock = new THREE.Clock();
    function animate() {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      rings.forEach((r, idx) => { r.mesh.rotation.z += r.speed; r.mesh.position.y = -1 + Math.sin(t * 1.4 + idx) * 0.12; });
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < pCount; i++) { pos[i * 3 + 1] = pOrigY[i] + Math.sin(t * 1.1 + pos[i * 3] * 0.45) * 0.35; }
      pGeo.attributes.position.needsUpdate = true;
      camera.position.x += (mouseX * 3.5 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 1.8 + 1 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();
    const handleResize = () => { if (!mount) return; camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('mousemove', onMM); window.removeEventListener('resize', handleResize); renderer.dispose(); pGeo.dispose(); pMat.dispose(); };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (badgeRef.current) tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 });
      if (titleRef.current) tl.fromTo(titleRef.current, { opacity: 0, y: 40, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1 }, '-=0.4');
      if (subtitleRef.current) tl.fromTo(subtitleRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
      if (ctaRef.current) tl.fromTo(ctaRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.7 }, '-=0.5');
      if (statsRef.current) tl.fromTo(Array.from(statsRef.current.children), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, '-=0.3');
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0730 0%, #0c041c 45%, #05020c 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />
      <div className="orb-gold" style={{ width: 700, height: 700, top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="orb-violet" style={{ width: 500, height: 500, bottom: '100px', left: '-100px' }} />
      <div className="orb-gold" style={{ width: 400, height: 400, bottom: '200px', right: '-80px', animationDelay: '-5s' }} />
      <FloatingNotes count={14} />

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="w-full max-w-5xl mx-auto text-center">

          <div ref={badgeRef} className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(251,191,36,0.3)', boxShadow: '0 0 30px rgba(245,158,11,0.12)', backdropFilter: 'blur(16px)' }}
            >
              <span style={{ color: '#f59e0b', fontSize: '14px' }}>✦</span>
              <span className="text-amber-200 font-bold text-xs tracking-widest uppercase">Sangeeta Sangama • Indian Classical Platform</span>
              <span style={{ color: '#f59e0b', fontSize: '14px' }}>✦</span>
            </div>
          </div>

          <h1
            ref={titleRef}
            className="font-black tracking-tight leading-tight mb-6"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.8rem, 7vw, 6.5rem)', lineHeight: '1.07' }}
          >
            <span className="text-white">Orchestrate</span>{' '}
            <span
              style={{ background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 40%, #ec4899 75%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Sublime<br />Concerts
            </span>
            <br />
            <span className="text-white">in Perfect Swara</span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-purple-200/75 leading-relaxed mx-auto mb-12"
            style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.2rem)', maxWidth: '640px' }}
          >
            Invite revered Carnatic & Hindustani maestros — Vocalists, Mridangists,
            Tablaiyas, Veena Vidushis, and Venu Flutists — with zero scheduling conflicts.
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/schedule" className="btn-gold w-full sm:w-auto">
              <span>🪕</span>
              <span>Schedule a Concert</span>
              <svg width="16" height="16" style={{ width: '16px', height: '16px' }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/dashboard" className="btn-glass w-full sm:w-auto">
              <span>View Sabha Dashboard</span>
            </Link>
          </div>

          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="card-luxury p-5 text-center cursor-default">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div
                  className="text-3xl font-black mb-1"
                  style={{ fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(135deg, #fef08a, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {stat.num}
                </div>
                <div className="text-[11px] font-semibold text-purple-300/65 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-2 opacity-40">
            <span className="text-[10px] tracking-widest uppercase text-purple-300 font-semibold">Explore More</span>
            <div className="w-0.5 h-10 rounded-full overflow-hidden bg-white/10">
              <div className="w-full bg-amber-400 rounded-full animate-breathe" style={{ height: '40%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ENSEMBLE SECTION */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-pill mx-auto mb-4">The Classical Ensemble</div>
            <h2
              className="font-black mb-4"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', background: 'linear-gradient(135deg, #fef08a, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Indian Classical Instruments
            </h2>
            <div className="section-divider mb-4" />
            <p className="text-purple-300/65 text-sm max-w-md mx-auto">
              SwarSetu is crafted specifically for the nuance and tradition of Indian classical music.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INSTRUMENTS.map((inst, i) => (
              <div key={i} className="card-luxury group p-7 relative overflow-hidden">
                <div
                  className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(245,158,11,0.1) 0%, transparent 65%)' }}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110"
                      style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
                    >
                      {inst.icon}
                    </div>
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                      style={{ background: 'rgba(147,51,234,0.18)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.25)' }}
                    >
                      {inst.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition-colors duration-300">{inst.name}</h3>
                  <div className="text-xs text-amber-400 font-semibold mb-3">{inst.role}</div>
                  <p className="text-sm text-purple-200/60 leading-relaxed">{inst.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div
            className="p-12 sm:p-16 rounded-3xl relative overflow-hidden text-center"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(147,51,234,0.16) 100%)', border: '1px solid rgba(251,191,36,0.28)', boxShadow: '0 30px 70px -15px rgba(0,0,0,0.7), 0 0 60px rgba(245,158,11,0.12)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-5">🪕</div>
              <h3
                className="font-black mb-4"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', background: 'linear-gradient(135deg, #fef08a, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                Ready to Assemble Your Concert Troupe?
              </h3>
              <p className="text-purple-200/75 text-sm max-w-lg mx-auto mb-10 leading-relaxed">
                Choose your venue, set the auspicious date, and send invitations with automatic priority confirmation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/schedule" className="btn-gold">
                  <span>Orchestrate Concert Now</span>
                  <span>→</span>
                </Link>
                <Link to="/artists" className="btn-glass">
                  <span>Browse Maestros</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
