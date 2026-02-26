import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbState } from '../types/chat';

interface VoiceOrbCanvasProps {
  state: OrbState;
  amplitude: number; // 0 to 1
  onTap: () => void;
}

export default function VoiceOrbCanvas({ state, amplitude, onTap }: VoiceOrbCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const glowLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const size = 200; // Increased size for better presence
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particle Configuration
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution
      const r = 0.8 * Math.pow(Math.random(), 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Random slow drift velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      // Initial grayscale
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);

    // Inner Glow Light
    const glowLight = new THREE.PointLight(0xffffff, 1, 5);
    glowLightRef.current = glowLight;
    scene.add(glowLight);

    let rafId: number;
    const targetColor = new THREE.Color();
    const currentColor = new THREE.Color(0xcccccc);

    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);

      const time = Date.now() * 0.001;
      const isHighEnergy = state === 'listening' || state === 'speaking';

      // 1. Color State Management
      if (isHighEnergy) {
        targetColor.setHex(0x2dd4bf); // Soft Cyan/Teal
      } else if (state === 'processing') {
        targetColor.setHex(0xffffff);
      } else {
        targetColor.setHex(0xaaaaaa); // Neutral Grayscale
      }
      currentColor.lerp(targetColor, 0.05);

      // 2. Breathing and Scale
      const baseScale = isHighEnergy ? 1.15 : 1.0;
      const breatheSpeed = isHighEnergy ? 3 : 1.5;
      const breatheAmount = isHighEnergy ? 0.05 : 0.03;
      const pulse = baseScale + Math.sin(time * breatheSpeed) * breatheAmount;
      particles.scale.set(pulse, pulse, pulse);

      // 3. Particle Motion
      const posAttr = geometry.attributes.position;
      const colAttr = geometry.attributes.color;
      const speedMult = isHighEnergy ? (1 + amplitude * 3) : 1;

      for (let i = 0; i < particleCount; i++) {
        // Slow rotation/drift inside the sphere
        const px = posAttr.getX(i);
        const py = posAttr.getY(i);
        const pz = posAttr.getZ(i);

        // Apply velocities and some noise
        posAttr.setX(i, px + velocities[i * 3] * speedMult);
        posAttr.setY(i, py + velocities[i * 3 + 1] * speedMult);
        posAttr.setZ(i, pz + velocities[i * 3 + 2] * speedMult);

        // Containment: wrap particles back if they drift too far
        const dist = Math.sqrt(px * px + py * py + pz * pz);
        if (dist > 0.9) {
          posAttr.setX(i, px * 0.95);
          posAttr.setY(i, py * 0.95);
          posAttr.setZ(i, pz * 0.95);
        }

        // Color update
        colAttr.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // 4. Glow Logic
      glowLight.color.copy(currentColor);
      glowLight.intensity = isHighEnergy ? (2 + amplitude * 5) : (1 + Math.sin(time) * 0.5);

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [state]);

  return (
    <div
      ref={containerRef}
      onClick={onTap}
      className="relative flex items-center justify-center cursor-pointer"
      style={{
        width: 200,
        height: 200,
      }}
    >
      {/* Soft shadow base - cleaner without the green tint */}
      <div className="absolute w-32 h-6 bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/5 blur-xl pointer-events-none" />
    </div>
  );
}
