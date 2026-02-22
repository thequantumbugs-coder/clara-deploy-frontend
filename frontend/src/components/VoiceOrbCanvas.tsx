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

    // RADIUM GREEN COLORS (Matching Text Containers)
    const radiumGreen = 0x00ff78; // Signature glowing radium green
    const deepRadium = 0x059669; // Denser green for depth

    // 1. EVENT HORIZON (PITCH BLACK SHADOW)
    const sphereGeo = new THREE.SphereGeometry(0.8, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const shadow = new THREE.Mesh(sphereGeo, sphereMat);
    shadowRef.current = shadow;
    group.add(shadow);

    // 2. PHOTON RING (Thin bright edge) - RADIUM GREEN
    const ringGeo = new THREE.TorusGeometry(0.82, 0.012, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: radiumGreen,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const photonRing = new THREE.Mesh(ringGeo, ringMat);
    group.add(photonRing);

    // 3. MAIN ACCRETION DISK - RADIUM GREEN
    const diskGeo = new THREE.TorusGeometry(1.2, 0.1, 16, 100);
    const diskMat = new THREE.MeshStandardMaterial({
      color: radiumGreen,
      transparent: true,
      opacity: 0.7,
      emissive: radiumGreen,
      emissiveIntensity: 3.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const accretionDisk = new THREE.Mesh(diskGeo, diskMat);
    accretionDisk.rotation.x = Math.PI / 2.1;
    diskRef.current = accretionDisk;
    group.add(accretionDisk);

    // 4. LENSING DISK - RADIUM GREEN
    const lensGeo = new THREE.TorusGeometry(1.05, 0.07, 16, 100);
    const lensMat = new THREE.MeshStandardMaterial({
      color: radiumGreen,
      transparent: true,
      opacity: 0.5,
      emissive: radiumGreen,
      emissiveIntensity: 2.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const lensingRing = new THREE.Mesh(lensGeo, lensMat);
    lensRef.current = lensingRing;
    group.add(lensingRing);

    // 5. EXTERNAL VOLUMETRIC GLOW
    const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const glowMat = new THREE.MeshStandardMaterial({
      color: radiumGreen,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // LIGHTING - RADIUM GREEN PROJECTION
    const glowLight = new THREE.PointLight(radiumGreen, 3, 7);
    glowLight.position.set(0, 0, 1.2);
    glowLightRef.current = glowLight;
    scene.add(glowLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    let rafId: number;
    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);

      if (group && accretionDisk && lensingRing) {
        // Rotations
        accretionDisk.rotation.z += 0.012;
        lensingRing.rotation.z -= 0.008;

        group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
        group.rotation.y = Math.cos(Date.now() * 0.0005) * 0.1;

        if (state === 'idle' || state === 'off') {
          const t = Date.now() * 0.0012;
          const pulse = 1 + Math.sin(t) * 0.03;
          shadow.scale.set(pulse, pulse, pulse);
          accretionDisk.scale.set(pulse, pulse, pulse);
          lensingRing.scale.set(pulse, pulse, pulse);

          glowLight.intensity = 1.2 + Math.sin(t) * 0.8;
          diskMat.emissiveIntensity = 3.5 + Math.sin(t) * 2;
        }

        if (state === 'listening' || state === 'speaking') {
          const distortion = 1 + amplitude * 0.45;
          const energy = amplitude * 12;

          shadow.scale.set(distortion, distortion, distortion);
          accretionDisk.scale.set(distortion * 1.15, distortion * 1.05, distortion);
          lensingRing.scale.set(distortion * 0.95, distortion * 1.15, distortion);

          diskMat.emissiveIntensity = 4.5 + energy * 4;
          lensMat.emissiveIntensity = 3.5 + energy * 4;
          glowLight.intensity = 5 + energy * 6;

          accretionDisk.rotation.z += 0.02 + amplitude * 0.2;
          lensingRing.rotation.z -= 0.02 + amplitude * 0.2;
        }

        if (state === 'processing') {
          accretionDisk.rotation.z += 0.15;
          lensingRing.rotation.z += 0.12;
          diskMat.emissiveIntensity = 2 + Math.sin(Date.now() * 0.04) * 10;
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
      {/* Soft shadow base */}
      <div className="absolute w-24 h-4 bottom-[20%] left-1/2 -translate-x-1/2 rounded-full bg-black/40 blur-lg pointer-events-none" />
    </div>
  );
}
