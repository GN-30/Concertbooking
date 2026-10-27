// src/components/MusicVisualizer3D.jsx
// Authentic Indian Classical "Nada Brahma" Acoustic 3D Visualizer
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function MusicVisualizer3D({ className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4.8;
    camera.position.y = 0.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Concentric Tanpura Acoustic Resonant Waves (Golden Rings) ──
    const rings = [];
    for (let i = 0; i < 4; i++) {
      const radius = 1.0 + i * 0.45;
      const torusGeo = new THREE.TorusGeometry(radius, 0.02, 16, 80);
      const torusMat = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0xf59e0b : 0xc084fc,
        emissive: i % 2 === 0 ? 0xd97706 : 0x7c3aed,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.7 - i * 0.1,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 3 + i * 0.2;
      torus.userData = { speedX: 0.006 + i * 0.002, speedZ: 0.004 + i * 0.003 };
      scene.add(torus);
      rings.push(torus);
    }

    // ── Glowing Central "Shadja / Nada" Sacred Sphere ───────────
    const sphereGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.95,
      shininess: 150,
    });
    const centerSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(centerSphere);

    // ── Floating Shruti Microtone Embers ────────────────────────
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const gold = new THREE.Color(0xfde047);
    const amethyst = new THREE.Color(0xd8b4fe);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * 2.5;
      positions[i * 3] = Math.cos(angle) * dist;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * dist;

      const c = Math.random() > 0.4 ? gold : amethyst;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Warm Temple Lamps & Lighting ───────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.4);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 3, 10);
    goldLight.position.set(2, 3, 2);
    scene.add(goldLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 10);
    purpleLight.position.set(-2, -2, 2);
    scene.add(purpleLight);

    // ── Animation Loop ─────────────────────────────────────────
    let frameId;
    let elapsed = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);
      elapsed += 0.016;

      rings.forEach((ring, idx) => {
        ring.rotation.x += ring.userData.speedX;
        ring.rotation.z += ring.userData.speedZ;
        const wave = Math.sin(elapsed * 2 + idx);
        ring.scale.setScalar(1 + wave * 0.08);
      });

      // Pulse central pitch
      const pitchPulse = 1 + Math.sin(elapsed * 3) * 0.12;
      centerSphere.scale.setScalar(pitchPulse);

      // Rotate scene slowly
      scene.rotation.y += 0.003;

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
