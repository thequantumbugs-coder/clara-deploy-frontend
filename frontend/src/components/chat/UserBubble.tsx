import React from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';
import type { TextMessage } from '../../types/chat';

interface UserBubbleProps {
  message: TextMessage;
}

export default function UserBubble({ message }: UserBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex items-start gap-4 w-full max-w-[85%] ml-auto flex-row-reverse"
    >
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/20"
        aria-hidden
      >
        <User className="w-6 h-6 text-stone-300" style={{ minWidth: 24, minHeight: 24 }} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col items-end">
        <div
          className="rounded-2xl px-6 py-5 border border-neo-mint/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 230, 207, 0.18) 0%, rgba(168, 230, 207, 0.08) 100%)',
          }}
        >
          <p
            className="text-stone-100 font-medium leading-relaxed tracking-wide text-right"
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
