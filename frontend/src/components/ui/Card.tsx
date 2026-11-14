import React from 'react';
import { motion } from 'motion/react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subdued' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  selected = false,
  hoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  const paddingClass = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  const variantClass = {
    default: 'bg-surface border border-border-subtle shadow-xs',
    elevated: 'bg-surface-elevated border border-border-subtle shadow-md',
    subdued: 'bg-surface-subdued border border-border-subtle',
    glass: 'bg-surface/85 backdrop-blur-md border border-border-subtle/80 shadow-luxury',
    interactive:
      'bg-surface border border-border-subtle hover:border-accent hover:shadow-md cursor-pointer transition-all',
  }[variant];

  const selectedClass = selected
    ? 'border-accent ring-2 ring-accent/30 shadow-emerald-glow/20'
    : '';

  const isInteractive = hoverable || variant === 'interactive' || !!onClick;

  if (isInteractive) {
    return (
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.18, ease: 'easeOut' } }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`rounded-card text-primary transition-colors ${variantClass} ${selectedClass} ${paddingClass} ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={`rounded-card text-primary ${variantClass} ${selectedClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

