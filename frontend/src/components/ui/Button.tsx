import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl select-none outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none transition-all';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-primary text-surface hover:opacity-90 shadow-sm active:opacity-100',
    secondary:
      'bg-surface-subdued text-primary hover:bg-surface-hover border border-border-subtle active:bg-surface-hover',
    accent:
      'bg-accent text-white hover:bg-accent-hover shadow-sm active:bg-accent-hover',
    ghost:
      'bg-transparent text-secondary hover:text-primary hover:bg-surface-subdued active:bg-surface-subdued',
    danger:
      'bg-danger text-white hover:opacity-90 shadow-sm active:opacity-100',
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...(props as any)}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {children}
          {icon && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
};
