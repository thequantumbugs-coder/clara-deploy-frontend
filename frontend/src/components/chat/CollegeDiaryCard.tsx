import React from 'react';
import { motion } from 'motion/react';
import type { CollegeBriefMessage as CollegeBriefMessageType } from '../../types/chat';

interface CollegeDiaryCardProps {
  message: CollegeBriefMessageType;
}

export default function CollegeDiaryCard({ message }: CollegeDiaryCardProps) {
  const pages = message.pages?.length ? message.pages : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[75%]"
    >
      <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="max-h-[min(70vh,640px)] overflow-y-auto no-scrollbar p-6">
          {pages.map((page, index) => {
            const isCover = page.id === 'cover' || (!page.title && !page.content);
            if (isCover) {
              return (
                <div
                  key={page.id || index}
                  className="flex flex-col items-center justify-center py-8 px-4 text-center border-b border-white/10 last:border-b-0"
                >
                  <p
                    className="font-display italic font-semibold text-stone-100 tracking-tight leading-tight"
                    style={{ fontSize: 'clamp(1.75rem, 2.5vw + 18px, 2.25rem)' }}
                  >
                    SAI VIDYA
                  </p>
                  <p
                    className="font-display italic font-semibold text-stone-100 tracking-tight mt-1"
                    style={{ fontSize: 'clamp(1.25rem, 1.8vw + 14px, 1.5rem)' }}
                  >
                    INSTITUTE OF TECHNOLOGY
                  </p>
                  <p
                    className="text-stone-400 tracking-wide mt-3"
                    style={{ fontSize: 'clamp(1rem, 1.2vw + 12px, 1.125rem)' }}
                  >
                    Learn to lead
                  </p>
                </div>
              );
            }
            return (
              <section
                key={page.id || index}
                className="py-6 border-b border-white/10 last:border-b-0"
              >
                {page.title && (
                  <h3
                    className="font-display italic font-semibold text-stone-100 tracking-wide"
                    style={{ fontSize: 'clamp(1.35rem, 2vw + 16px, 1.75rem)' }}
                  >
                    {page.title}
                  </h3>
                )}
                {page.subtitle && (
                  <p
                    className="mt-1 text-neo-mint/90 font-medium tracking-wider uppercase"
                    style={{ fontSize: 'clamp(0.95rem, 1.2vw + 10px, 1.1rem)' }}
                  >
                    {page.subtitle}
                  </p>
                )}
                {page.content && (
                  <p
                    className="mt-3 text-stone-300 leading-relaxed tracking-wide"
                    style={{ fontSize: 'clamp(1.125rem, 1.5vw + 12px, 1.25rem)' }}
                  >
                    {page.content}
                  </p>
                )}
                {page.image && (
                  <div className="mt-4 rounded-xl overflow-hidden bg-stone-900/50 aspect-video">
                    <img
                      src={page.image}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>
        {message.timestamp && (
          <p className="px-6 py-3 text-xs tracking-widest uppercase text-stone-500 border-t border-white/10">
            {message.timestamp}
          </p>
        )}
      </div>
    </motion.article>
  );
}
