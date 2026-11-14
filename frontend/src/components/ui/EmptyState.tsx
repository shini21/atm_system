import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-card bg-surface-subdued/40 border border-border-subtle ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-surface-subdued border border-border-subtle flex items-center justify-center text-tertiary mb-3 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      {description && (
        <p className="text-xs text-secondary mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

