import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Download, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { CardMessage as CardMessageType } from '../../types/chat';

interface CardMessageProps {
  message: CardMessageType;
  listeningLabel?: string;
}

export default function CardMessage({ message, listeningLabel }: CardMessageProps) {
  const { t } = useLanguage();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[min(90%,720px)]"
    >
      <div className="glass rounded-2xl overflow-hidden">
        {/* Tags above image */}
        {message.tags && message.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 pt-5">
            {message.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-stone-100 border border-white/20 bg-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Image - high clarity, scaled for 13.3" */}
        {message.image && (
          <div className="relative w-full aspect-video mt-3 overflow-hidden bg-stone-900/50">
            <img
              src={message.image}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Listening indicator inside card (optional) */}
        {message.showListening && listeningLabel && (
          <div className="flex items-center justify-center gap-2 py-4 px-5">
            <span className="text-sm tracking-[0.2em] uppercase text-stone-400">{listeningLabel}</span>
            <div className="flex gap-1 items-end h-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-neo-mint"
                  animate={{ height: ['40%', '100%', '40%'] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Title + description + actions row */}
        <div className="p-5 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3
              className="text-stone-100 font-semibold tracking-wide break-words"
              style={{ fontSize: 'clamp(1.5rem, 2.5vw + 18px, 2rem)' }}
            >
              {message.title}
            </h3>
            {message.description && (
              <p
                className="mt-2 text-stone-400 tracking-wide break-words"
                style={{ fontSize: 'clamp(1rem, 1.5vw + 12px, 1.25rem)' }}
              >
                {message.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Audio playback - optional, min 100px tap */}
            <button
              type="button"
              className="touch-button min-w-[100px] min-h-[100px] rounded-full glass flex items-center justify-center border-white/10 hover:border-neo-mint/30 transition-colors"
              aria-label="Play audio"
            >
              <Volume2 className="w-8 h-8 text-stone-400" />
            </button>

            {/* CTAs */}
            {message.cta?.map((cta, idx) => {
              const isPrimary = idx === 0;
              const Icon = isPrimary ? ExternalLink : Download;
              return (
                <a
                  key={cta.action}
                  href={cta.href ?? '#'}
                  className={`touch-button min-w-[100px] min-h-[100px] rounded-2xl flex items-center justify-center gap-2 px-5 font-medium tracking-wide transition-colors ${
                    isPrimary
                      ? 'bg-neo-mint/25 border-2 border-neo-mint/50 text-stone-100 hover:bg-neo-mint/35'
                      : 'glass border border-white/10 text-stone-300 hover:border-white/20'
                  }`}
                  style={{ fontSize: 'clamp(1rem, 1.2vw + 12px, 1.125rem)' }}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span>{cta.label || (isPrimary ? t('cardOpen') : t('cardAsset'))}</span>
                </a>
              );
            })}
          </div>
        </div>
        {message.timestamp && (
          <p className="px-5 pb-3 text-xs tracking-widest uppercase text-stone-500">
            {message.timestamp}
          </p>
        )}
      </div>
    </motion.article>
  );
}
