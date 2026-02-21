import React from 'react';
import { motion } from 'motion/react';
import { Bot } from 'lucide-react';
import type { TextMessage } from '../../types/chat';

interface ClaraBubbleProps {
  message: TextMessage;
}

export default function ClaraBubble({ message }: ClaraBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex items-start gap-4 w-full max-w-[85%]"
    >
      {/* Avatar with subtle glow */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(168,230,207,0.15)]"
        aria-hidden
      >
        <Bot className="w-6 h-6 text-neo-mint" style={{ minWidth: 24, minHeight: 24 }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="glass rounded-2xl px-6 py-5">
          <p
            className="text-stone-100 leading-relaxed tracking-wide"
            style={{ fontSize: 'clamp(1.375rem, 2vw + 12px, 1.5rem)' }}
          >
            {message.text}
          </p>
        </div>
        {message.timestamp && (
          <p className="mt-2 text-xs tracking-widest uppercase text-stone-500">
            {message.timestamp}
          </p>
        )}
      </div>
    </motion.div>
  );
}
