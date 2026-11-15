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
      'bg-success-subtle text-success border border-success/20 ',
    warning:
      'bg-warning-subtle text-warning border border-warning/40 ',
    error:
      'bg-danger-subtle text-danger border border-danger/25 ',
    info:
      'bg-info-subtle text-info border border-info/20',
    champagne:
      'bg-info-subtle text-info border border-info/20',
    neutral:
      'bg-surface-subdued text-secondary border border-border-subtle dark:bg-surface-elevated dark:text-secondary dark:border-border-subtle',
  };

  const dotColors = {
    success: 'bg-success shadow-[0_0_6px_rgba(0,180,136,0.6)]',
    warning: 'bg-warning shadow-[0_0_6px_rgba(224,163,50,0.6)]',
    error: 'bg-danger shadow-[0_0_6px_rgba(224,83,83,0.6)]',
    info: 'bg-info shadow-[0_0_6px_rgba(22,116,184,0.6)]',
    champagne: 'bg-info shadow-[0_0_6px_rgba(22,116,184,0.6)]',
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

