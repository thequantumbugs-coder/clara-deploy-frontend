import React from 'react';
import { motion } from 'motion/react';
import type { ImageCardMessage as ImageCardMessageType } from '../../types/chat';

interface ImageCardProps {
  message: ImageCardMessageType;
}

export default function ImageCard({ message }: ImageCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[75%]"
    >
      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <div className="relative w-full aspect-video bg-stone-900/50">
          <img
            src={message.image}
            alt={message.title ?? ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {(message.title || message.description) && (
          <div className="p-5">
            {message.title && (
              <h3
                className="text-stone-100 font-semibold tracking-wide"
                style={{ fontSize: 'clamp(1.25rem, 2vw + 14px, 1.5rem)' }}
              >
                {message.title}
              </h3>
            )}
            {message.description && (
              <p
                className="mt-2 text-stone-400 tracking-wide"
                style={{ fontSize: 'clamp(1rem, 1.3vw + 12px, 1.125rem)' }}
              >
                {message.description}
              </p>
            )}
          </div>
        )}
        {message.timestamp && (
          <p className="px-5 pb-3 text-xs tracking-widest uppercase text-stone-500">
            {message.timestamp}
          </p>
        )}
      </div>
    </motion.article>
  );
}
