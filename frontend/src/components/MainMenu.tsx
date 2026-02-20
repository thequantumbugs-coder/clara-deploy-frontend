import React from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  CreditCard, 
  LayoutGrid, 
  Briefcase, 
  Map, 
  Phone,
  Mic
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MENU_ITEMS = [
  { id: 'admissions', icon: GraduationCap, label: 'admissions' },
  { id: 'fees', icon: CreditCard, label: 'fees' },
  { id: 'departments', icon: LayoutGrid, label: 'departments' },
  { id: 'placements', icon: Briefcase, label: 'placements' },
  { id: 'campus', icon: Map, label: 'campus' },
  { id: 'contact', icon: Phone, label: 'contact' },
];

export default function MainMenu({ onAction }: { onAction: (id: string) => void }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col p-16"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-20">
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-5xl font-display italic text-stone-100 mb-4"
          >
            {t('welcome')}
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-stone-400 tracking-widest uppercase text-sm"
          >
            {t('mainMenu')}
          </motion.p>
        </div>

        {/* Voice Trigger Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onAction('voice')}
          className="glass touch-button rounded-full w-24 h-24 flex items-center justify-center border-neo-mint/20 hover:border-neo-mint/50 group"
        >
          <Mic className="w-8 h-8 text-neo-mint group-hover:scale-110 transition-transform" />
          <div className="absolute -bottom-12 text-[10px] tracking-[0.3em] uppercase text-neo-mint opacity-60">
            Voice Mode
          </div>
        </motion.button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-3 gap-8 flex-1">
        {MENU_ITEMS.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAction(item.id)}
            className="glass touch-button group rounded-3xl flex flex-col items-center justify-center p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-neo-mint/0 group-hover:bg-neo-mint/[0.02] transition-colors" />
            
            <item.icon className="w-12 h-12 text-stone-400 group-hover:text-neo-mint mb-6 transition-colors" />
            
            <span className="text-2xl font-medium text-stone-200 tracking-wide">
              {t(item.label)}
            </span>

            {/* Subtle indicator */}
            <div className="absolute bottom-6 w-1 h-1 rounded-full bg-stone-700 group-hover:bg-neo-mint group-hover:w-8 transition-all duration-500" />
          </motion.button>
        ))}
      </div>

      {/* Contextual TTS Display (Summarized) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex items-center gap-4 text-stone-500 italic"
      >
        <div className="w-2 h-2 rounded-full bg-neo-mint animate-pulse" />
        <span className="text-sm tracking-wide">
          CLARA: "{t('ttsInstructionMenu')}"
        </span>
      </motion.div>
    </motion.div>
  );
}
