import React from 'react';
import { motion } from 'motion/react';
import type { SystemMessage as SystemMessageType } from '../../types/chat';

interface SystemBubbleProps {
  message: SystemMessageType;
}

export default function SystemBubble({ message }: SystemBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex justify-center w-full"
    >
      <div className="chat-bubble-system">{message.text}</div>
    </motion.div>
  );
}
