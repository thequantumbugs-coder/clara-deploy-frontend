import React from 'react';

/**
 * Branch-themed subtle cartoon line art background.
 * Engineering motifs: chip, code brackets, gears, building, neural nodes, circuits, briefcase.
 * Very low opacity (5–8%), tiled SVG, blend overlay. WhatsApp-like clean background.
 */
const OPACITY = 0.06;

export default function BranchBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ mixBlendMode: 'overlay' }}
      aria-hidden
    >
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: OPACITY }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="branch-pattern" x="0" y="0" width="320" height="240" patternUnits="userSpaceOnUse">
            {/* Chip / circuit */}
            <path d="M40 60h24v8H40v-8zm0 16h24v8H40v-8zm48-24h8v24h-8V52z" fill="none" stroke="#E9EDEF" strokeWidth="1.2" />
            <rect x="56" y="56" width="16" height="16" fill="none" stroke="#E9EDEF" strokeWidth="1" rx="2" />
            {/* Code brackets */}
            <path d="M120 70l-12 10 12 10M160 70l12 10-12 10" fill="none" stroke="#E9EDEF" strokeWidth="1.2" />
            <path d="M140 58v24" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            {/* Gear */}
            <circle cx="220" cy="80" r="14" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            <path d="M220 68v6M220 92v6M206 80h6M228 80h6M213 71l4 4M223 81l4 4M213 89l4-4M223 79l4-4" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            {/* Building outline */}
            <path d="M280 100v40h-24v-16h-8v16h-24V100h56zM252 120h8v8h-8v-8z" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            {/* Neural nodes */}
            <circle cx="60" cy="160" r="6" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            <circle cx="100" cy="150" r="6" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            <circle cx="100" cy="180" r="6" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            <path d="M66 158l30-6M66 162l30 6M106 156l20 8M106 174l20-8" fill="none" stroke="#E9EDEF" strokeWidth="0.8" />
            {/* Briefcase */}
            <rect x="160" y="150" width="32" height="24" rx="2" fill="none" stroke="#E9EDEF" strokeWidth="1" />
            <path d="M164 150h24v4h-24v-4z" fill="none" stroke="#E9EDEF" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#branch-pattern)" />
      </svg>
    </div>
  );
}
