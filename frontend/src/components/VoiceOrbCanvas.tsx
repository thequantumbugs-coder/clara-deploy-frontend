import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { animate } from 'animejs';
import type { OrbState } from '../types/chat';

interface VoiceOrbCanvasProps {
  state: OrbState;
  amplitude: number; // 0 to 1
  onTap: () => void;
}

export default function VoiceOrbCanvas({ state, amplitude, onTap }: VoiceOrbCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Refs for animation
  const groupRef = useRef<THREE.Group | null>(null);
  const diskRef = useRef<THREE.Mesh | null>(null);
  const lensRef = useRef<THREE.Mesh | null>(null);
  const shadowRef = useRef<THREE.Mesh | null>(null);
  const glowLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Clean up
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const size = 160;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // FIXED RADIUM GREEN - No shifts allowed
    const PURE_RADIUM = 0x00ff78;

    // 1. EVENT HORIZON
    const sphereGeo = new THREE.SphereGeometry(0.8, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const shadow = new THREE.Mesh(sphereGeo, sphereMat);
    shadowRef.current = shadow;
    group.add(shadow);

    // 2. PHOTON RING - STRICT GREEN
    const ringGeo = new THREE.TorusGeometry(0.82, 0.012, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: PURE_RADIUM,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const photonRing = new THREE.Mesh(ringGeo, ringMat);
    group.add(photonRing);

    // 3. MAIN ACCRETION DISK - STRICT GREEN
    const diskGeo = new THREE.TorusGeometry(1.2, 0.1, 16, 100);
    const diskMat = new THREE.MeshStandardMaterial({
      color: PURE_RADIUM,
      transparent: true,
      opacity: 0.7,
      emissive: PURE_RADIUM,
      emissiveIntensity: 3.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const accretionDisk = new THREE.Mesh(diskGeo, diskMat);
    accretionDisk.rotation.x = Math.PI / 2.1;
    diskRef.current = accretionDisk;
    group.add(accretionDisk);

    // 4. LENSING DISK - STRICT GREEN
    const lensGeo = new THREE.TorusGeometry(1.05, 0.07, 16, 100);
    const lensMat = new THREE.MeshStandardMaterial({
      color: PURE_RADIUM,
      transparent: true,
      opacity: 0.5,
      emissive: PURE_RADIUM,
      emissiveIntensity: 2.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const lensingRing = new THREE.Mesh(lensGeo, lensMat);
    lensRef.current = lensingRing;
    group.add(lensingRing);

    // 5. EXTERNAL VOLUMETRIC GLOW - STRICT GREEN
    const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const glowMat = new THREE.MeshStandardMaterial({
      color: PURE_RADIUM,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // LIGHTING - STRICT GREEN
    const glowLight = new THREE.PointLight(PURE_RADIUM, 3, 7);
    glowLight.position.set(0, 0, 1.2);
    glowLightRef.current = glowLight;
    scene.add(glowLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    let rafId: number;
    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);

      if (group && accretionDisk && lensingRing) {
        accretionDisk.rotation.z += 0.012;
        lensingRing.rotation.z -= 0.008;

        group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
        group.rotation.y = Math.cos(Date.now() * 0.0005) * 0.1;

        if (state === 'idle' || state === 'off') {
          // VERY calm idle
          const t = Date.now() * 0.0008;
          const pulse = 1 + Math.sin(t) * 0.02;
          shadow.scale.set(pulse, pulse, pulse);
          accretionDisk.scale.set(pulse, pulse, pulse);
          lensingRing.scale.set(pulse, pulse, pulse);

          glowLight.intensity = 1.0 + Math.sin(t) * 0.4;
          diskMat.emissiveIntensity = 2.5 + Math.sin(t) * 1.0;

          // Slow drift rotation
          accretionDisk.rotation.z += 0.005;
          lensingRing.rotation.z -= 0.003;
        }

        if (state === 'listening' || state === 'speaking') {
          // EXCITING listening state: 30% larger and much faster
          const baseScale = 1.3;
          const distortion = (1 + amplitude * 0.5) * baseScale;
          const energy = amplitude * 10;

          // Electric flicker effect: High frequency + jitter
          const flicker = Math.sin(Date.now() * 0.05) * 2.0 + (Math.random() * 1.2);

          shadow.scale.set(distortion * 0.8, distortion * 0.8, distortion * 0.8);
          accretionDisk.scale.set(distortion * 1.1, distortion * 1.0, distortion);
          lensingRing.scale.set(distortion * 0.9, distortion * 1.1, distortion);

          diskMat.emissiveIntensity = 6 + energy * 4 + flicker;
          lensMat.emissiveIntensity = 5 + energy * 4 + flicker;
          glowLight.intensity = 7 + energy * 6 + flicker;

          // Much faster energetic rotation
          accretionDisk.rotation.z += 0.06 + amplitude * 0.3;
          lensingRing.rotation.z -= 0.05 + amplitude * 0.3;
        }

        if (state === 'processing') {
          // Fast steady rotation during processing
          accretionDisk.rotation.z += 0.2;
          lensingRing.rotation.z += 0.16;
          diskMat.emissiveIntensity = 5; // Steady glow
          lensMat.emissiveIntensity = 4;
          glowLight.intensity = 5;
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      diskGeo.dispose();
      diskMat.dispose();
      lensGeo.dispose();
      lensMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
    };
  }, [state]);

  return (
    <div
      ref={containerRef}
      onClick={onTap}
      className="relative flex items-center justify-center cursor-pointer"
      style={{
        width: 160,
        height: 160,
        filter: 'drop-shadow(0 0 25px rgba(0, 255, 120, 0.4))'
      }}
    >
      <div className="absolute w-24 h-4 bottom-[20%] left-1/2 -translate-x-1/2 rounded-full bg-black/40 blur-lg pointer-events-none" />
    </div>
  );
}
