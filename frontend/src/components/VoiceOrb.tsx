import React from 'react';
import VoiceOrbCanvas from './VoiceOrbCanvas';
import type { OrbState } from '../types/chat';

interface VoiceOrbProps {
  state: OrbState;
  onTap: () => void;
  amplitude?: number; // 0 to 1
  label?: string;
}

export default function VoiceOrb({ state, onTap, amplitude = 0, label }: VoiceOrbProps) {
  return (
    <div className="flex flex-col items-center">
      <VoiceOrbCanvas
        state={state}
        amplitude={amplitude}
        onTap={onTap}
      />
      {label && (
        <label className="mt-2 text-xs uppercase tracking-widest text-white/40 font-medium animate-pulse">
          {label}
        </label>
      )}
    </div>
  );
}
