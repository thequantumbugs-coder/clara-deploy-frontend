import React from 'react';
import { motion } from 'motion/react';
import { Mic } from 'lucide-react';
import type { OrbState } from '../types/chat';

const ORB_SIZE = 130;
const NEO_MINT = 'rgba(168, 230, 207, 1)';
const NEO_MINT_GLOW = 'rgba(168, 230, 207, 0.4)';
const NEO_MINT_SOFT = 'rgba(168, 230, 207, 0.15)';

interface VoiceOrbProps {
  state: OrbState;
  onTap: () => void;
  label?: string;
}

export default function VoiceOrb({ state, onTap, label }: VoiceOrbProps) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center justify-center touch-button rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-neo-mint/50"
      style={{ minWidth: ORB_SIZE, minHeight: ORB_SIZE, width: ORB_SIZE, height: ORB_SIZE }}
      aria-label={label ?? 'Voice input'}
    >
      {/* Idle: soft breathing glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-neo-mint/20 border-2 border-neo-mint/30"
        animate={
          state === 'idle'
            ? {
                boxShadow: [
                  `0 0 24px ${NEO_MINT_SOFT}`,
                  `0 0 36px ${NEO_MINT_SOFT}`,
                  `0 0 24px ${NEO_MINT_SOFT}`,
                ],
                scale: [1, 1.02, 1],
              }
            : {}
        }
        transition={{
          duration: 2.5,
          repeat: state === 'idle' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Listening: pulse + expanding ring */}
      {state === 'listening' && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neo-mint"
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                `0 0 20px ${NEO_MINT_GLOW}`,
                `0 0 48px ${NEO_MINT_GLOW}`,
                `0 0 20px ${NEO_MINT_GLOW}`,
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-neo-mint"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-neo-mint"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.6,
            }}
          />
        </>
      )}

      {/* Processing: subtle rotating gradient (lightweight) */}
      {state === 'processing' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-neo-mint/60"
          animate={{
            boxShadow: [
              `0 0 28px ${NEO_MINT_SOFT}`,
              `0 0 40px ${NEO_MINT_GLOW}`,
              `0 0 28px ${NEO_MINT_SOFT}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Speaking: gentle light ripple */}
      {state === 'speaking' && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neo-mint"
            animate={{
              scale: [1, 1.04, 1],
              boxShadow: [
                `0 0 24px ${NEO_MINT_GLOW}`,
                `0 0 40px ${NEO_MINT_GLOW}`,
                `0 0 24px ${NEO_MINT_GLOW}`,
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-neo-mint/80"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}

      {/* Base orb fill - visible in all states */}
      <motion.div
        className="absolute inset-0 rounded-full bg-neo-mint/25 border-2 border-neo-mint/40"
        style={{ backgroundColor: state !== 'idle' ? 'rgba(168, 230, 207, 0.2)' : undefined }}
      />

      {/* Icon */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        animate={state === 'listening' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: state === 'listening' ? Infinity : 0 }}
      >
        <Mic
          className="w-12 h-12 text-stone-100 drop-shadow-md"
          style={{ minWidth: 48, minHeight: 48 }}
        />
      </motion.div>

      {label && (
        <span className="mt-3 text-sm tracking-[0.2em] uppercase text-stone-400 font-medium">
          {label}
        </span>
      )}
    </motion.button>
  );
}
