import React from 'react';
import { motion } from 'motion/react';
import type { TextMessage } from '../../types/chat';

interface ClaraBubbleProps {
  message: TextMessage;
}

export default function ClaraBubble({ message }: ClaraBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex justify-start w-full"
    >
      <div className="flex flex-col items-start max-w-[60%]">
        <div className="chat-bubble-received">
          <p className="text-[#E9EDEF] leading-[1.6]" style={{ fontSize: 'clamp(18px, 1.5vw + 14px, 20px)' }}>
            {message.text}
          </p>
        </div>
        {message.timestamp && <p className="chat-timestamp">{message.timestamp}</p>}
      </div>
    </motion.div>
  );
}
