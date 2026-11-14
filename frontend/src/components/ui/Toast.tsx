import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { IconButton } from './Button';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan flex-shrink-0" />,
  };

  const borders = {
    success: 'border-success/30 dark:border-emerald-500/30',
    error: 'border-danger/30 dark:border-rose-500/30',
    warning: 'border-amber-500/30 dark:border-amber-500/30',
    info: 'border-cyan/30 dark:border-cyan/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-xl bg-surface/95 backdrop-blur-md border ${borders[type]} shadow-luxury text-primary flex items-start gap-3`}
        >
          <div className="mt-0.5">{icons[type]}</div>
          <div className="flex-1 min-w-0">
            {title && <h4 className="text-xs font-semibold text-primary">{title}</h4>}
            <p className="text-xs text-secondary mt-0.5 leading-relaxed break-words">{message}</p>
          </div>
          <IconButton
            icon={<X className="w-3.5 h-3.5" />}
            aria-label="Dismiss toast"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="-mr-1 -mt-1 text-tertiary hover:text-primary"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

