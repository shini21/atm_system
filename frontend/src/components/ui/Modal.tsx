import React, { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus into the dialog, trap Tab, restore focus on close
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    const raf = requestAnimationFrame(() => {
      const first = focusables()[0];
      (first ?? panelRef.current)?.focus();
    });
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) { e.preventDefault(); return; }
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', trap);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-midnight/70"
            aria-hidden="true"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            ref={panelRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className={`relative outline-none w-full ${maxWidthClass} z-10 p-5 sm:p-6 rounded-dialog bg-surface border border-border-strong text-primary shadow-luxury overflow-hidden my-auto`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between pb-3.5 border-b border-border-subtle mb-4 gap-3">
                <div className="min-w-0">
                  {title && (
                    <h3
                      id={titleId}
                      className="font-sans text-xl sm:text-2xl font-semibold tracking-tight text-primary"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p id={descId} className="text-xs text-secondary mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <IconButton
                    icon={<X className="w-4 h-4" />}
                    aria-label="Close dialog"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="flex-shrink-0 -mr-1 -mt-1 text-secondary hover:text-primary"
                  />
                )}
              </div>
            )}

            {/* Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
