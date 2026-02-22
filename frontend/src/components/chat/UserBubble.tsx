import React from 'react';
import { motion } from 'motion/react';
import type { TextMessage } from '../../types/chat';

interface UserBubbleProps {
  message: TextMessage;
}

export default function UserBubble({ message }: UserBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex justify-end w-full"
    >
      <div className="flex flex-col items-end max-w-[60%]">
        <div className="chat-bubble-sent">
          <p className="text-[#E9EDEF] leading-[1.6] text-right" style={{ fontSize: 'clamp(18px, 1.5vw + 14px, 20px)' }}>
            {message.text}
          </p>
        </div>
        {message.timestamp && <p className="chat-timestamp text-right">{message.timestamp}</p>}
      </div>
    </motion.div>
  );
}
