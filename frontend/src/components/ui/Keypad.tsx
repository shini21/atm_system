import React from 'react';
import { motion } from 'motion/react';
import { Delete, RotateCcw } from 'lucide-react';

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

  return (
    <div className="w-full max-w-[280px] mx-auto select-none">
      <div className="grid grid-cols-3 gap-2 xs:gap-3">
        {keys.map((num) => (
          <motion.button
            key={num}
            type="button"
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.04 }}
            whileTap={{ scale: disabled ? 1 : 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => onKeyPress(num)}
            className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-surface-subdued hover:bg-surface-hover active:bg-surface-hover border border-border-subtle text-xl sm:text-2xl font-medium text-primary shadow-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            {num}
          </motion.button>
        ))}

        {/* Clear Key */}
        <motion.button
          type="button"
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: disabled ? 1 : 0.94 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onClear}
          className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-surface-subdued hover:bg-surface-hover border border-border-subtle text-xs font-medium text-secondary shadow-sm flex items-center justify-center transition-colors cursor-pointer"
          title="Clear PIN"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>

        {/* Zero */}
        <motion.button
          type="button"
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: disabled ? 1 : 0.94 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={() => onKeyPress('0')}
          className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-surface-subdued hover:bg-surface-hover active:bg-surface-hover border border-border-subtle text-xl sm:text-2xl font-medium text-primary shadow-sm flex items-center justify-center transition-colors cursor-pointer"
        >
          0
        </motion.button>

        {/* Backspace */}
        <motion.button
          type="button"
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: disabled ? 1 : 0.94 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onBackspace}
          className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-surface-subdued hover:bg-surface-hover border border-border-subtle text-xs font-medium text-secondary shadow-sm flex items-center justify-center transition-colors cursor-pointer"
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </motion.button>
      </div>

      {onSubmit && (
        <motion.button
          type="button"
          disabled={submitDisabled || isLoading || disabled}
          whileTap={{ scale: submitDisabled || isLoading || disabled ? 1 : 0.98 }}
          onClick={onSubmit}
          className="w-full mt-4 h-11 rounded-xl bg-primary text-surface font-medium text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Authenticating...</span>
            </span>
          ) : (
            submitLabel
          )}
        </motion.button>
      )}
    </div>
  );
};
