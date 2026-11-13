import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { Keypad } from '../components/ui/Keypad';
import { DecryptedText } from '../components/ui/DecryptedText';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export const PinPage: React.FC = () => {
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const { cardStatus, login, isLoading, error, clearCard, clearError } = useAuth();
  const { t } = useLanguage();
  const { registerKeypadListener, registerSideKeys } = useHardware();
  const navigate = useNavigate();

  // Redirect to welcome if no card is inserted
  useEffect(() => {
    if (!cardStatus) {
      navigate('/', { replace: true });
    }
  }, [cardStatus, navigate]);

  const handleSubmitPin = useCallback(
    async (pinToSubmit: string) => {
      if (pinToSubmit.length !== 4 || isLoading) return;

      const success = await login(pinToSubmit);
      if (success) {
        navigate('/dashboard');
      } else {
        // Trigger tactile spring shake on error
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPin('');
      }
    },
    [isLoading, login, navigate]
  );

  // Register physical side function keys on terminal chassis
  useEffect(() => {
    return registerSideKeys({
      R1: pin.length === 4
        ? {
            id: 'R1',
            label: 'Confirm PIN',
            onClick: () => handleSubmitPin(pin),
          }
        : null,
      R4: {
        id: 'R4',
        label: 'Cancel & Return Card',
        onClick: () => {
          clearCard();
          navigate('/');
        },
      },
    });
  }, [registerSideKeys, pin, handleSubmitPin, clearCard, navigate]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      clearError();

      // Auto-submit on 4th digit for seamless luxury feel
      if (nextPin.length === 4) {
        handleSubmitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    clearError();
  };

  const handleClear = () => {
    setPin('');
    clearError();
  };

  // Hardware PIN Pad listener
  useEffect(() => {
    const unsubscribe = registerKeypadListener((key) => {
      if (isLoading) return;
      if (/^[0-9]$/.test(key)) {
        handleKeyPress(key);
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      } else if (key === 'CLEAR') {
        handleClear();
      } else if (key === 'CANCEL') {
        clearCard();
        navigate('/');
      } else if (key === 'ENTER') {
        if (pin.length === 4) {
          handleSubmitPin(pin);
        }
      }
    });
    return unsubscribe;
  }, [registerKeypadListener, isLoading, pin, handleSubmitPin, clearCard, navigate]);

  if (!cardStatus) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-2 sm:py-4">
      {/* Top Breadcrumb / Card Pill with DecryptedText Reveal */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-subdued border border-border-subtle mb-6 text-xs shadow-xs"
      >
        <span className="font-mono font-medium text-primary">
          <DecryptedText text={cardStatus.maskedCardNumber || cardStatus.cardNumber} />
        </span>
        <span className="w-1 h-1 rounded-full bg-border-strong" />
        <span className="text-secondary font-medium">
          <DecryptedText text={cardStatus.cardHolderName} />
        </span>
        <span className="w-1 h-1 rounded-full bg-border-strong" />
        <span className="text-tertiary">{cardStatus.accountType.replace(' Account', '')}</span>
      </motion.div>

      {/* Screen Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          {t('pin.title')}
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          {t('pin.subtitle')}
        </p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="w-full max-w-xs mb-4 p-3 rounded-2xl bg-danger-subtle border border-danger/25 text-danger text-xs flex items-start gap-2 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Verification Failed</p>
              <p className="opacity-90 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Animated PIN Indicator Dots with Spring Pop & Error Flash */}
      <motion.div
        animate={isShaking ? {
          x: [-12, 12, -8, 8, -4, 4, 0],
          transition: { duration: 0.45, ease: 'easeInOut' },
        } : {}}
        className={`flex items-center justify-center gap-4 mb-6 py-3 px-6 rounded-2xl border transition-all duration-200 ${
          isShaking
            ? 'bg-danger-subtle border-danger shadow-[0_0_12px_rgba(239,68,68,0.25)]'
            : 'bg-surface-subdued/80 border-border-subtle'
        }`}
      >
        {[0, 1, 2, 3].map((index) => {
          const isFilled = index < pin.length;
          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                scale: isFilled ? [1, 1.45, 1] : 1,
                backgroundColor: isShaking
                  ? 'var(--danger)'
                  : isFilled
                  ? 'var(--text-primary)'
                  : 'transparent',
                borderColor: isShaking
                  ? 'var(--danger)'
                  : isFilled
                  ? 'var(--text-primary)'
                  : 'var(--border-strong)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="w-4 h-4 rounded-full border-2 transition-colors"
            />
          );
        })}
      </motion.div>

      {/* Security notice & attempts left */}
      <div className="text-[11px] text-tertiary text-center mb-5 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3 text-tertiary" />
        <span>
          {cardStatus.remainingAttempts < 3 ? (
            <strong className="text-warning font-medium">
              {cardStatus.remainingAttempts} attempts remaining before card locks
            </strong>
          ) : (
            <span>3 attempts remaining</span>
          )}
        </span>
      </div>

      {/* Refined Circular Touch Keypad */}
      <Keypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onClear={handleClear}
        onSubmit={() => handleSubmitPin(pin)}
        submitLabel="Confirm PIN"
        submitDisabled={pin.length !== 4}
        isLoading={isLoading}
      />

      {/* Cancel Action */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            clearCard();
            navigate('/');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel and return card</span>
        </button>
      </div>
    </div>
  );
};
