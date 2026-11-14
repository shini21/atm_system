import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { Keypad } from '../components/ui/Keypad';
import { DecryptedText } from '../components/ui/DecryptedText';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center py-2 sm:py-4 w-full">
      {/* Centered Glassmorphic Authentication Card per Style Guide §10.1 */}
      <div className="w-full max-w-md mx-auto rounded-3xl bg-surface/90 dark:bg-surface/80 backdrop-blur-md border border-border-subtle p-5 sm:p-7 shadow-luxury transition-all">
        {/* Card Identification & Encrypted Security Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full bg-surface-subdued border border-border-subtle mb-5 text-xs shadow-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-primary truncate">
              <DecryptedText text={cardStatus.maskedCardNumber || cardStatus.cardNumber} />
            </span>
            <span className="w-1 h-1 rounded-full bg-border-strong flex-shrink-0" />
            <span className="text-secondary font-medium truncate">
              <DecryptedText text={cardStatus.cardHolderName} />
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] text-tertiary flex-shrink-0 font-medium">
            <ShieldCheck className="w-3 h-3 text-accent" />
            <span>256-Bit</span>
          </div>
        </motion.div>

        {/* Screen Title */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            {t('pin.title')}
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            {t('pin.subtitle')}
          </p>
        </div>

        {/* Error Alert Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="w-full mb-4 p-3 rounded-2xl bg-danger-subtle border border-danger/30 text-danger text-xs flex items-start gap-2 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger">Verification Failed</p>
                <p className="opacity-95 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 Animated PIN Indicator Pips with Glowing Pop & Error Flash */}
        <motion.div
          animate={
            isShaking
              ? {
                  x: [-12, 12, -8, 8, -4, 4, 0],
                  transition: { duration: 0.45, ease: 'easeInOut' },
                }
              : {}
          }
          className={`flex items-center justify-center gap-4 mb-5 py-3.5 px-6 rounded-2xl border transition-all duration-200 ${
            isShaking
              ? 'bg-danger-subtle border-danger shadow-[0_0_16px_rgba(239,68,68,0.3)]'
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
                  scale: isFilled ? [1, 1.4, 1] : 1,
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
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isFilled && !isShaking
                    ? 'shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                    : ''
                }`}
              />
            );
          })}
        </motion.div>

        {/* Security Notice & Remaining Attempts Indicator */}
        <div className="text-center mb-5 flex items-center justify-center">
          {cardStatus.remainingAttempts < 3 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-subtle border border-warning/30 text-warning text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{cardStatus.remainingAttempts} attempts remaining before card lockout</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-tertiary">
              <Lock className="w-3 h-3 text-tertiary" />
              <span>3 attempts remaining • Secure input</span>
            </div>
          )}
        </div>

        {/* Refined Tactile Numeric Touch Keypad */}
        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSubmit={() => handleSubmitPin(pin)}
          submitLabel="Confirm PIN"
          submitDisabled={pin.length !== 4}
          isLoading={isLoading}
        />

        {/* Cancel & Return Card Action */}
        <div className="mt-5 text-center">
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
    </div>
  );
};
