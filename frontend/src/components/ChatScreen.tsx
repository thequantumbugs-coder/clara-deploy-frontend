import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  type ChatMessage,
  type OrbState,
  isTextMessage,
  isSystemMessage,
  isCardMessage,
  isCollegeBriefMessage,
  isImageCardMessage,
} from '../types/chat';
import { useVoiceFrequencyAnalyser } from '../hooks/useVoiceAnalyser';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import ClaraBubble from './chat/ClaraBubble';
import UserBubble from './chat/UserBubble';
import SystemBubble from './chat/SystemBubble';
import CardMessage from './chat/CardMessage';
import CollegeDiaryCard from './chat/CollegeDiaryCard';
import ImageCard from './chat/ImageCard';
import VoiceOrb from './VoiceOrb';
import BackgroundParticles from './BackgroundParticles';
import { useMessageAnimation } from '../hooks/useAnimeAnimations';

const GREETING_TTS_DURATION_MS = 4500;

interface ChatScreenProps {
  messages: ChatMessage[];
  isListening?: boolean;
  isProcessing?: boolean;
  isConnected?: boolean;
  voiceInputMode?: 'browser' | 'backend';
  payload?: { audioBase64?: string; error?: string } | null;
  onBack: () => void;
  onOrbTap: () => void;
  sendMessage: (msg: object) => void;
}

export default function ChatScreen({
  messages: payloadMessages,
  isListening: propIsListening = false,
  isProcessing = false,
  isConnected = true,
  voiceInputMode = 'browser',
  payload,
  onBack,
  onOrbTap,
  sendMessage,
}: ChatScreenProps) {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => []);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isPlayingBackendAudio, setIsPlayingBackendAudio] = useState(false);
  const userRequestedListeningRef = useRef(false);
  const lastPlayedAudioRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);
  const hasStartedRef = useRef(false);

  const addSystemMessage = useCallback((text: string) => {
    const sys: ChatMessage = { id: `sys-${Date.now()}`, role: 'system', text };
    setMessages((prev) => [...prev, sys]);
  }, []);

  const { startListening: startSpeechRecognition } = useSpeechRecognition(
    sendMessage,
    language,
    (_, message) => addSystemMessage(message),
    () => addSystemMessage("I didn't catch that. Please try again.")
  );

  const voiceAnalyser = useVoiceFrequencyAnalyser(orbState === 'listening');

  useEffect(() => {
    const audioBase64 = payload?.audioBase64;
    if (!audioBase64 || audioBase64 === lastPlayedAudioRef.current || isPlayingRef.current) return;
    lastPlayedAudioRef.current = audioBase64;
    isPlayingRef.current = true;
    setIsPlayingBackendAudio(true);
    try {
      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const onEnd = () => {
        URL.revokeObjectURL(url);
        isPlayingRef.current = false;
        setIsPlayingBackendAudio(false);
      };
      audio.addEventListener('ended', onEnd);
      audio.addEventListener('error', onEnd);
      audio.play().catch(() => onEnd());
    } catch {
      isPlayingRef.current = false;
      setIsPlayingBackendAudio(false);
    }
  }, [payload?.audioBase64]);

  useEffect(() => {
    if (isPlayingBackendAudio) {
      setOrbState('speaking');
      return;
    }
    if (isProcessing) {
      setOrbState('processing');
      return;
    }
    if (propIsListening) {
      setOrbState('listening');
      return;
    }
    if (hasStartedRef.current) setOrbState('idle');
  }, [propIsListening, isProcessing, isPlayingBackendAudio]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setOrbState('idle');
    setTimeout(() => {
      setMessages((prev) => (prev.length === 0 ? [{ id: 'greet-1', role: 'clara', text: t('welcome_message') }] : prev));
    }, 500);
  }, [t]);

  useEffect(() => {
    if (payloadMessages.length > 0) {
      setMessages(payloadMessages);
    }
  }, [payloadMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleOrbTap = () => {
    if (!isConnected) {
      addSystemMessage('Waiting for backend connection...');
      return;
    }
    if (orbState === 'idle') {
      userRequestedListeningRef.current = true;
      if (voiceInputMode === 'backend') {
        onOrbTap();
      } else {
        startSpeechRecognition();
      }
    }
  };

  return (
    <div className="chat-screen-premium">
      {/* Background Layer */}
      <div className="chat-bg-college" />
      <div className="chat-bg-overlay" />
      <BackgroundParticles />

      {/* Main Glass Panel */}
      <div className="chat-panel-glass">
        <header className="chat-header-minimal">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white/60" />
          </button>
          {/* Header branding removed as requested */}
        </header>

        <div ref={scrollRef} className="chat-messages-scroll no-scrollbar">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageWrapper msg={msg} propIsListening={propIsListening} t={t} />
              </div>
            ))}

            {/* WhatsApp-style Typing Indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="clara-typing-container"
              >
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice Orb positioned at bottom as requested */}
        <div className="voice-visualizer-container">
          <VoiceOrb
            state={orbState}
            amplitude={voiceAnalyser.smoothedRms}
            onTap={handleOrbTap}
            label={propIsListening ? t('listening') : undefined}
          />
        </div>
      </div>

      {/* Ambient glow at bottom center */}
      <div className="chat-panel-glow" />
    </div>
  );
}

function MessageWrapper({ msg, propIsListening, t }: { msg: ChatMessage; propIsListening: boolean; t: any }) {
  const role = ('role' in msg) ? (msg as any).role : 'clara';
  const itemRef = useMessageAnimation(role === 'user' ? 'user' : 'clara');

  return (
    <div ref={itemRef} className="flex flex-col w-full opacity-0">
      {isSystemMessage(msg) ? (
        <SystemBubble message={msg} />
      ) : isCollegeBriefMessage(msg) ? (
        <CollegeDiaryCard message={msg} />
      ) : isImageCardMessage(msg) ? (
        <ImageCard message={msg} />
      ) : isCardMessage(msg) ? (
        <CardMessage
          message={msg}
          listeningLabel={propIsListening ? t('listening') : undefined}
        />
      ) : isTextMessage(msg) ? (
        <div className={role === 'user' ? 'bubble-glass-user' : 'bubble-glass-clara'}>
          {msg.text}
        </div>
      ) : null}
    </div>
  );
}
