import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useWebSocket } from './hooks/useWebSocket';
import { LanguageProvider } from './context/LanguageContext';

// Components
import SleepScreen from './components/SleepScreen';
import LanguageSelect from './components/LanguageSelect';
import MainMenu from './components/MainMenu';
import VoiceConversation from './components/VoiceConversation';

export default function App() {
  const { state, payload, setManualState, sendMessage } = useWebSocket('ws://localhost:8000/ws/clara');
  
  // Debug mode: Listen for keys 0-8
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = parseInt(e.key);
      if (key >= 0 && key <= 8) {
        console.log(`Debug: Switching to state ${key}`);
        setManualState(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setManualState]);

  const renderState = () => {
    switch (state) {
      case 0:
        return (
          <motion.div key="sleep" className="w-full h-full">
            <SleepScreen 
              onWake={() => {
                sendMessage({ action: 'wake' });
                setManualState(3); // Transition to language select
              }} 
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="lang" className="w-full h-full">
            <LanguageSelect 
              onSelect={() => {
                sendMessage({ action: 'language_selected' });
                setManualState(4); // Transition to main menu
              }} 
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="menu" className="w-full h-full">
            <MainMenu 
              onAction={(id) => {
                sendMessage({ action: 'menu_select', id });
                if (id === 'voice') setManualState(5);
              }} 
            />
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="voice" className="w-full h-full">
            <VoiceConversation 
              messages={payload?.messages || [
                { id: '1', role: 'clara', text: 'Hello! I am CLARA. How can I help you today?' }
              ]}
              isListening={payload?.isListening ?? true}
              onBack={() => setManualState(4)}
            />
          </motion.div>
        );
      default:
        return (
          <motion.div 
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="glass p-12 rounded-3xl text-center">
              <h2 className="text-3xl font-display italic mb-4">State {state}</h2>
              <p className="text-stone-400 tracking-widest uppercase text-sm">
                This interface is currently under development.
              </p>
              <button 
                onClick={() => setManualState(0)}
                className="mt-8 px-8 py-4 border border-white/10 rounded-full hover:bg-white/5 transition-colors"
              >
                Return to Sleep
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <LanguageProvider>
      <div className="relative w-full h-full bg-stone-950 overflow-hidden">
        {/* Global Warm Glow */}
        <div className="absolute inset-0 warm-glow pointer-events-none z-0" />
        
        {/* Main Content */}
        <main className="relative z-10 w-full h-full">
          <AnimatePresence mode="wait">
            {renderState()}
          </AnimatePresence>
        </main>

        {/* Subtle Kiosk Frame/Overlay */}
        <div className="absolute inset-0 border-[24px] border-black/20 pointer-events-none z-50 rounded-[40px]" />
        
        {/* Debug Indicator (Hidden in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-4 right-4 text-[8px] text-stone-800 uppercase tracking-widest pointer-events-none">
            Kiosk Mode Active • State: {state} • WS: Connected
          </div>
        )}
      </div>
    </LanguageProvider>
  );
}
