import React, { useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import type { OrbState } from '../types/chat';

const ORB_DIAMETER = 150;
const NEO_MINT = { r: 168, g: 230, b: 207 };
const LERP = 0.12;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface VoiceOrbCanvasProps {
  state: OrbState;
  onTap: () => void;
  label?: string;
  /** Only present when state is 'listening' and mic is active */
  audio?: {
    smoothedRms: number;
    smoothedFrequency: number;
  };
}

export default function VoiceOrbCanvas({ state, onTap, label, audio }: VoiceOrbCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const scaleRef = useRef(1);
  const glowRef = useRef(0.2);
  const rippleRef = useRef(0);
  const breathRef = useRef(0);
  const opacityRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = ORB_DIAMETER;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const isOff = state === 'off';
    const isListening = state === 'listening';
    const isSpeaking = state === 'speaking';

    const loop = () => {
      t += 0.016;
      const targetOpacity = isOff ? 0.1 : 1;
      opacityRef.current = lerp(opacityRef.current, targetOpacity, 0.03);

      if (isOff) {
        scaleRef.current = lerp(scaleRef.current, 1, 0.05);
        glowRef.current = lerp(glowRef.current, 0.08, 0.05);
        rippleRef.current = 0;
        breathRef.current = 0;
      } else if (isListening && audio) {
        const amp = Math.min(audio.smoothedRms * 12, 1.2);
        const targetScale = 1 + amp * 0.18;
        scaleRef.current = lerp(scaleRef.current, targetScale, LERP);
        glowRef.current = lerp(glowRef.current, 0.25 + audio.smoothedFrequency * 0.35, LERP);
        rippleRef.current = lerp(rippleRef.current, 0.4 + audio.smoothedFrequency * 0.6, LERP);
        breathRef.current = 0;
      } else if (isSpeaking) {
        const breath = Math.sin(t * 0.8) * 0.03;
        scaleRef.current = lerp(scaleRef.current, 1 + breath, 0.08);
        glowRef.current = lerp(glowRef.current, 0.35, 0.05);
        rippleRef.current = (rippleRef.current + 0.02) % (Math.PI * 2);
        breathRef.current = breath;
      } else {
        const breath = Math.sin(t * 0.5) * 0.015;
        scaleRef.current = lerp(scaleRef.current, 1 + breath, 0.06);
        glowRef.current = lerp(glowRef.current, 0.18, 0.05);
        rippleRef.current = 0;
        breathRef.current = breath;
      }

      const cx = (size * dpr) / 2;
      const cy = (size * dpr) / 2;
      const baseR = (size / 2) * dpr * scaleRef.current;
      const opacity = opacityRef.current;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (opacity < 0.01) {
        animRef.current = requestAnimationFrame(loop);
        ctx.restore();
        return;
      }

      ctx.globalAlpha = opacity;

      const glowSize = baseR + 20 * dpr + glowRef.current * 40 * dpr;
      const gradientGlow = ctx.createRadialGradient(cx, cy, baseR * 0.3, cx, cy, glowSize);
      gradientGlow.addColorStop(0, `rgba(${NEO_MINT.r},${NEO_MINT.g},${NEO_MINT.b},${0.2 * glowRef.current})`);
      gradientGlow.addColorStop(0.6, `rgba(${NEO_MINT.r},${NEO_MINT.g},${NEO_MINT.b},${0.06 * glowRef.current})`);
      gradientGlow.addColorStop(1, 'rgba(168,230,207,0)');
      ctx.fillStyle = gradientGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
      ctx.fill();

      const orbGradient = ctx.createRadialGradient(
        cx - baseR * 0.3,
        cy - baseR * 0.3,
        0,
        cx,
        cy,
        baseR
      );
      orbGradient.addColorStop(0, `rgba(200,245,225,${0.5 * opacity})`);
      orbGradient.addColorStop(0.4, `rgba(${NEO_MINT.r},${NEO_MINT.g},${NEO_MINT.b},${0.35 * opacity})`);
      orbGradient.addColorStop(0.85, `rgba(${NEO_MINT.r},${NEO_MINT.g},${NEO_MINT.b},${0.2 * opacity})`);
      orbGradient.addColorStop(1, `rgba(${NEO_MINT.r},${NEO_MINT.g},${NEO_MINT.b},${0.08 * opacity})`);
      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${NEO_MINT.r},${NEO_MINT.g},${NEO_MINT.b},${0.4 * opacity})`;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.stroke();

      if (isSpeaking && rippleRef.current > 0) {
        const rippleR = baseR + Math.sin(rippleRef.current) * 8 * dpr;
        ctx.strokeStyle = `rgba(${NEO_MINT.r},${NEO_MINT.g},${NEO_MINT.b},${0.25 * (1 - rippleRef.current / (Math.PI * 2)) * opacity})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state, audio?.smoothedRms, audio?.smoothedFrequency]);

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onTap}
        className="relative flex items-center justify-center touch-button rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-neo-mint/50 cursor-pointer overflow-hidden"
        style={{
          minWidth: ORB_DIAMETER,
          minHeight: ORB_DIAMETER,
          width: ORB_DIAMETER,
          height: ORB_DIAMETER,
          background: 'transparent',
        }}
        aria-label={label ?? 'Voice input'}
      >
        <canvas
          ref={canvasRef}
          className="rounded-full pointer-events-none absolute inset-0"
          style={{ width: ORB_DIAMETER, height: ORB_DIAMETER, display: 'block' }}
        />
        <Mic className="relative z-10 w-10 h-10 text-stone-100/90 drop-shadow-md pointer-events-none" style={{ minWidth: 40, minHeight: 40 }} />
      </button>
      {label && (
        <span className="mt-3 text-sm tracking-[0.2em] uppercase text-stone-400 font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
