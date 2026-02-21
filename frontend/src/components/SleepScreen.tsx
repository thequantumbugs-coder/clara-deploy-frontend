import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

/* Local gradients so no external network (avoids ERR_NAME_NOT_RESOLVED when offline) */
const BACKGROUND_GRADIENTS = [
  'linear-gradient(135deg, rgba(30,30,35,0.95) 0%, rgba(20,22,28,0.9) 50%, rgba(15,15,18,0.95) 100%)',
  'linear-gradient(160deg, rgba(28,30,35,0.95) 0%, rgba(18,20,24,0.9) 50%, rgba(12,12,15,0.95) 100%)',
  'linear-gradient(120deg, rgba(25,28,32,0.95) 0%, rgba(22,24,28,0.9) 50%, rgba(18,18,22,0.95) 100%)',
];

export default function SleepScreen({ onWake }: { onWake: () => void }) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_GRADIENTS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-pointer"
      onClick={onWake}
      data-testid="sleep-screen"
    >
      {/* Drifting background gradients (no external images) */}
      {BACKGROUND_GRADIENTS.map((grad, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentIndex === index ? 0.85 : 0 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ background: grad }}
        />
      ))}

      {/* Warm Ambient Glow */}
      <div className="absolute inset-0 warm-glow pointer-events-none" />

      {/* Title block — scaled for 13" display (logo + separator + text) */}
      <div className="relative z-10 flex items-center justify-center gap-0 px-6">
        {/* Logo (circular emblem + SVIT banner) — larger for 13" */}
        <div
          className="w-[200px] min-w-[200px] h-[220px] flex-shrink-0 flex items-center justify-center"
          aria-hidden
        >
          <img
            src="/svit-logo.png"
            alt="SAI VIDYA INSTITUTE OF TECHNOLOGY"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Vertical separator */}
        <div className="w-0.5 h-[200px] bg-white flex-shrink-0 mx-8" />

        {/* Title text block — larger typography for 13" */}
        <div className="flex flex-col items-start text-left">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-[4rem] min-[1280px]:text-[4.5rem] font-bold uppercase tracking-tight text-white leading-tight"
          >
            SAI VIDYA
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 1 }}
            className="text-[2rem] min-[1280px]:text-[2.25rem] font-bold uppercase tracking-tight text-white leading-tight mt-2"
          >
            INSTITUTE OF TECHNOLOGY
          </motion.p>
          <div className="w-full h-0.5 bg-white mt-3 mb-3" style={{ minWidth: 'calc(100% + 12px)', marginLeft: '-6px' }} />
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl min-[1280px]:text-2xl font-normal text-white tracking-wide"
          >
            Learn to lead
          </motion.p>
        </div>
      </div>

      {/* Tap to wake hint — readable on 13" */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-28 left-0 right-0 flex justify-center"
      >
        <motion.span
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-base min-[1280px]:text-lg tracking-[0.25em] uppercase text-white/70 font-light"
        >
          {t('tapToWake')}
        </motion.span>
      </motion.div>

      {/* Decorative Lines — proportional for 13" */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
        <div className="h-px w-40 bg-white/10" />
        <div className="text-xs tracking-[0.4em] uppercase text-white/40">
          
        </div>
        <div className="h-px w-40 bg-white/10" />
      </div>
    </motion.div>
  );
}
