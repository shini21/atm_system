import React from 'react';
import { motion } from 'motion/react';
import { Delete, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/sound';
import { Button } from './Button';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  onSubmit,
  submitLabel = 'Confirm',
  submitDisabled = false,
  isLoading = false,
  disabled = false,
}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const keyLetters: Record<string, string> = {
    '1': '',
    '2': 'ABC',
    '3': 'DEF',
    '4': 'GHI',
    '5': 'JKL',
    '6': 'MNO',
    '7': 'PQRS',
    '8': 'TUV',
    '9': 'WXYZ',
    '0': '',
  };

  const handleKeyClick = (num: string) => {
    if (disabled || isLoading) return;
    sound.playKeyClick();
    onKeyPress(num);
  };

  const handleClearClick = () => {
    if (disabled || isLoading) return;
    sound.playKeyClick();
    onClear();
  };

  const handleBackspaceClick = () => {
    if (disabled || isLoading) return;
    sound.playKeyClick();
    onBackspace();
  };

  const handleSubmitClick = () => {
    if (disabled || submitDisabled || isLoading) return;
    sound.playKeyClick();
    onSubmit?.();
  };

  return (
    <div className="w-full max-w-[280px] xs:max-w-[300px] mx-auto select-none">
      <div className="grid grid-cols-3 gap-2.5 xs:gap-3">
        {keys.map((num) => (
          <motion.button
            key={num}
            type="button"
            disabled={disabled || isLoading}
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => handleKeyClick(num)}
            aria-label={`Digit ${num}`}
            className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-hover border border-border-subtle text-primary shadow-[0_3px_0_rgba(0,0,0,0.12)] dark:shadow-[0_3px_0_rgba(0,0,0,0.4)] active:shadow-none flex flex-col items-center justify-center transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <span className="text-xl sm:text-2xl font-semibold font-mono tabular-nums leading-none">
              {num}
            </span>
            {keyLetters[num] ? (
              <span className="text-[9px] font-sans tracking-widest text-tertiary uppercase mt-0.5 leading-none group-hover:text-secondary transition-colors">
                {keyLetters[num]}
              </span>
            ) : (
              <span className="h-2.5" />
            )}
          </motion.button>
        ))}

        {/* Clear Key */}
        <motion.button
          type="button"
          disabled={disabled || isLoading}
          whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={handleClearClick}
          aria-label="Clear PIN"
          title="Clear PIN"
          className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-surface-subdued hover:bg-warning-subtle hover:border-warning/30 border border-border-subtle text-secondary hover:text-warning shadow-[0_3px_0_rgba(0,0,0,0.12)] dark:shadow-[0_3px_0_rgba(0,0,0,0.4)] active:shadow-none flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-warning focus-visible:outline-none"
        >
          <RotateCcw className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] uppercase tracking-wider font-medium">Clear</span>
        </motion.button>

        {/* Zero */}
        <motion.button
          type="button"
          disabled={disabled || isLoading}
          whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={() => handleKeyClick('0')}
          aria-label="Digit 0"
          className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-hover border border-border-subtle text-primary shadow-[0_3px_0_rgba(0,0,0,0.12)] dark:shadow-[0_3px_0_rgba(0,0,0,0.4)] active:shadow-none flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <span className="text-xl sm:text-2xl font-semibold font-mono tabular-nums leading-none">
            0
          </span>
          <span className="h-2.5" />
        </motion.button>

        {/* Backspace */}
        <motion.button
          type="button"
          disabled={disabled || isLoading}
          whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          onClick={handleBackspaceClick}
          aria-label="Backspace"
          title="Backspace"
          className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl bg-surface-subdued hover:bg-danger-subtle hover:border-danger/30 border border-border-subtle text-secondary hover:text-danger shadow-[0_3px_0_rgba(0,0,0,0.12)] dark:shadow-[0_3px_0_rgba(0,0,0,0.4)] active:shadow-none flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-danger focus-visible:outline-none"
        >
          <Delete className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] uppercase tracking-wider font-medium">Del</span>
        </motion.button>
      </div>

      {onSubmit && (
        <div className="mt-4">
          <Button
            variant="primary"
            size="md"
            disabled={submitDisabled || disabled}
            isLoading={isLoading}
            onClick={handleSubmitClick}
            className="w-full h-11 font-medium shadow-sm"
          >
            {isLoading ? 'Authenticating...' : submitLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
