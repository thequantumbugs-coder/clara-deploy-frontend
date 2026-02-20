import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const ARCHITECTURAL_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=1920',
];

export default function SleepScreen({ onWake }: { onWake: () => void }) {
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % ARCHITECTURAL_IMAGES.length);
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
    >
      {/* Drifting Background Images */}
      {ARCHITECTURAL_IMAGES.map((img, index) => (
        <motion.div
          key={img}
          initial={{ opacity: 0, scale: 1.1, x: -20 }}
          animate={{
            opacity: currentImage === index ? 0.4 : 0,
            scale: currentImage === index ? 1 : 1.1,
            x: currentImage === index ? 20 : -20,
          }}
          transition={{ duration: 15, ease: 'linear' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Warm Ambient Glow */}
      <div className="absolute inset-0 warm-glow pointer-events-none" />

      {/* Minimalist Text */}
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-6xl font-display italic tracking-widest text-stone-100 mb-8"
        >
          CLARA
        </motion.h1>
        
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-xl tracking-[0.3em] uppercase text-stone-400 font-light"
        >
          {t('tapToWake')}
        </motion.div>
      </div>

      {/* Decorative Lines */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
        <div className="h-[1px] w-32 bg-white/10" />
        <div className="text-[10px] tracking-[0.5em] uppercase text-stone-500">
          Architectural Intelligence v2.0
        </div>
        <div className="h-[1px] w-32 bg-white/10" />
      </div>
    </motion.div>
  );
}
