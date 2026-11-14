import React from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'champagne' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  playAudio?: boolean;
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
  playAudio = true,
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-control select-none outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none transition-all focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-control',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  };

  const variantStyles = {
    primary:
      'bg-accent text-white hover:bg-accent-hover shadow-sm active:opacity-95 shadow-emerald-glow/20',
    secondary:
      'bg-surface-subdued text-primary hover:bg-surface-hover border border-border-subtle active:bg-surface-hover shadow-xs',
    accent:
      'bg-cyan text-white hover:opacity-90 shadow-sm active:opacity-100 shadow-cyan-glow/30',
    champagne:
      'bg-champagne text-white hover:opacity-90 shadow-sm active:opacity-100',
    ghost:
      'bg-transparent text-secondary hover:text-primary hover:bg-surface-subdued active:bg-surface-subdued',
    danger:
      'bg-danger text-white hover:opacity-90 shadow-sm active:opacity-100',
    outline:
      'bg-transparent text-primary border border-border-strong hover:bg-surface-subdued active:bg-surface-hover',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playAudio && !disabled && !isLoading) {
      sound.playKeyClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      disabled={disabled || isLoading}
      onClick={handleClick}
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
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'circle';
  playAudio?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'secondary',
  size = 'md',
  shape = 'rounded',
  playAudio = true,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const sizeClass = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size];

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  const variantClass = {
    primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
    secondary: 'bg-surface-subdued text-primary hover:bg-surface-hover border border-border-subtle',
    ghost: 'bg-transparent text-secondary hover:text-primary hover:bg-surface-subdued',
    outline: 'bg-transparent text-primary border border-border-strong hover:bg-surface-subdued',
    danger: 'bg-danger/10 text-danger hover:bg-danger hover:text-white',
  }[variant];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playAudio && !disabled) {
      sound.playKeyClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onClick={handleClick}
      className={`inline-flex items-center justify-center cursor-pointer select-none outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${sizeClass} ${shapeClass} ${variantClass} ${className}`}
      {...(props as any)}
    >
      {icon}
    </motion.button>
  );
};
