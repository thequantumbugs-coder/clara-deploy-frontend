import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useWebSocket } from './hooks/useWebSocket';
import { LanguageProvider } from './context/LanguageContext';

// Components
import SleepScreen from './components/SleepScreen';
import LanguageSelect from './components/LanguageSelect';
import ChatScreen from './components/ChatScreen';
import type { ChatMessage } from './types/chat';

export default function App() {
  const { state, payload, setManualState, sendMessage } = useWebSocket('ws://localhost:8000/ws/clara');
  const [urlOverrideState, setUrlOverrideState] = React.useState<number | null>(null);

  // E2E / test: ?state=5 opens chat directly; sticky so WS cannot overwrite
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('state');
    if (s !== null) {
      const n = parseInt(s, 10);
      if (n >= 0 && n <= 8) setUrlOverrideState(n);
    }
  }, []);

  const effectiveState = urlOverrideState !== null ? urlOverrideState : state;
  const setEffectiveState = (n: number) => {
    setUrlOverrideState(null);
    setManualState(n);
  };

  // Debug mode: Listen for keys 0-8
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = parseInt(e.key);
      if (key >= 0 && key <= 8) {
        console.log(`Debug: Switching to state ${key}`);
        setUrlOverrideState(null);
        setManualState(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setManualState]);

  const renderState = () => {
    switch (effectiveState) {
      case 0:
        return (
          <motion.div key="sleep" className="w-full h-full">
            <SleepScreen 
              onWake={() => {
                sendMessage({ action: 'wake' });
                setUrlOverrideState(null);
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
                setUrlOverrideState(null);
                setManualState(5); // Transition to chat (voice) — post-language flow
              }} 
            />
          </motion.div>
        );
      case 4:
      case 5:
        return (
          <motion.div key="voice" className="w-full h-full">
            <ChatScreen
              messages={(payload?.messages as ChatMessage[] | undefined) ?? []}
              isListening={payload?.isListening ?? false}
              isSpeaking={payload?.isSpeaking ?? false}
              isProcessing={payload?.isProcessing ?? false}
              onBack={() => setEffectiveState(3)}
              onOrbTap={() => sendMessage({ action: 'toggle_mic' })}
              sendMessage={sendMessage}
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
              <h2 className="text-3xl font-display italic mb-4">State {effectiveState}</h2>
              <p className="text-stone-400 tracking-widest uppercase text-sm">
                This interface is currently under development.
              </p>
              <button 
                onClick={() => setEffectiveState(0)}
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
            Kiosk Mode Active • State: {effectiveState} • WS: Connected
          </div>
        )}
      </div>
    </LanguageProvider>
  );
}
