import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'champagne';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-md font-mono',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg font-mono',
    lg: 'px-3 py-1.5 text-xs gap-2 rounded-lg font-sans font-medium',
  };

  const variantStyles = {
    success:
      'bg-success-subtle text-success border border-success/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
    warning:
      'bg-amber-500/10 text-amber-700 border border-amber-500/25 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30',
    error:
      'bg-danger-subtle text-danger border border-danger/25 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/30',
    info:
      'bg-cyan/10 text-cyan border border-cyan/25 dark:bg-cyan/15 dark:text-cyan dark:border-cyan/30',
    champagne:
      'bg-champagne/10 text-champagne border border-champagne/25 dark:bg-champagne/15 dark:text-champagne dark:border-champagne/30',
    neutral:
      'bg-surface-subdued text-secondary border border-border-subtle dark:bg-surface-elevated dark:text-secondary dark:border-border-subtle',
  };

  const dotColors = {
    success: 'bg-success shadow-[0_0_6px_rgba(0,180,136,0.6)]',
    warning: 'bg-warning shadow-[0_0_6px_rgba(224,163,50,0.6)]',
    error: 'bg-danger shadow-[0_0_6px_rgba(224,83,83,0.6)]',
    info: 'bg-cyan shadow-[0_0_6px_rgba(54,188,232,0.6)]',
    champagne: 'bg-champagne shadow-[0_0_6px_rgba(212,176,114,0.6)]',
    neutral: 'bg-secondary',
  };

  return (
    <span
      className={`inline-flex items-center font-medium leading-none select-none tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

