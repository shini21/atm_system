import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

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
  const shouldReduceMotion = useReducedMotion();
  const xOffset = direction === 'forward' ? 24 : -24;

  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={`w-full ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset, scale: 0.99 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -xOffset, scale: 0.99 }}
      transition={{
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

