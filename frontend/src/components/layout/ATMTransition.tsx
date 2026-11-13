import React from 'react';
import { motion } from 'motion/react';

interface ATMTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'forward' | 'backward';
}

export const ATMTransition: React.FC<ATMTransitionProps> = ({
  children,
  className = '',
  direction = 'forward',
}) => {
  const xOffset = direction === 'forward' ? 24 : -24;

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -xOffset, scale: 0.98 }}
      transition={{
        duration: 0.35,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

