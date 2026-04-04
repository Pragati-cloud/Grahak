import React, { useEffect } from 'react';
import { motion } from 'motion/react';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-8 right-8 z-[100] bg-on-surface text-surface px-6 py-3 rounded-full shadow-2xl font-body text-sm flex items-center gap-3"
    >
      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
      {message}
    </motion.div>
  );
};

export default Toast;
