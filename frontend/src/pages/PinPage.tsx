import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { Keypad } from '../components/ui/Keypad';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, AlertCircle, ArrowLeft, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { ApexCard } from '../components/cards/ApexCard';
import { BrandLogo } from '../components/brand/BrandLogo';
import { useTheme } from '../context/ThemeContext';

export const PinPage: React.FC = () => {
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);
  const { theme } = useTheme();
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
    <div className="w-full grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 lg:gap-12 items-center max-w-4xl mx-auto py-1">
      {/* LEFT — identity: official mark, selected card, cardholder */}
      <section aria-label="Card identification" className="flex flex-col items-center md:items-start gap-4">
        <BrandLogo variant="horizontal" surface={theme === 'dark' ? 'dark' : 'light'} className="w-40 h-[3.4rem]" />
        <ApexCard
          cardNumber={cardStatus.cardNumber}
          cardHolderName={cardStatus.cardHolderName}
          expiryDate={cardStatus.expiryDate}
          accountType={cardStatus.accountType}
          isBlocked={cardStatus.blocked}
          isExpired={cardStatus.expired}
          flippable={false}
        />
        <dl className="text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 w-full max-w-[420px]">
          <dt className="text-tertiary">Cardholder</dt>
          <dd className="font-medium text-primary truncate">{cardStatus.cardHolderName}</dd>
          <dt className="text-tertiary">Card</dt>
          <dd className="font-mono text-primary">{cardStatus.maskedCardNumber || cardStatus.cardNumber}</dd>
        </dl>
      </section>

      {/* RIGHT — PIN entry */}
      <section aria-labelledby="pin-heading" className="w-full max-w-sm mx-auto md:mx-0 rounded-card bg-surface border border-border-subtle p-5 sm:p-6 shadow-luxury">
        <div className="text-center mb-4">
          <h1 id="pin-heading" className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-primary">{t('pin.title')}</h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">{t('pin.subtitle')}</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="w-full mb-4 p-3 rounded-control bg-danger-subtle border border-danger/30 text-danger text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div><p className="font-semibold">Verification failed</p><p className="mt-0.5">{error}</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIN field: four slots; digits are masked unless the user chooses to reveal them */}
        <motion.div
          animate={isShaking ? { x: [-10, 10, -6, 6, -3, 3, 0], transition: { duration: 0.4 } } : {}}
          className={`flex items-center justify-center gap-3 mb-2 py-3 px-4 rounded-control border ${isShaking ? 'bg-danger-subtle border-danger' : 'bg-surface-subdued border-border-subtle'}`}
          role="group"
          aria-label={`PIN, ${pin.length} of 4 digits entered`}
        >
          {[0, 1, 2, 3].map((index) => {
            const filled = index < pin.length;
            return (
              <div key={index} className={`w-11 h-12 rounded-md border-2 flex items-center justify-center font-mono text-2xl ${filled ? 'border-accent bg-accent/5 text-primary' : 'border-border-strong text-tertiary'}`}>
                {filled ? (showPin ? pin[index] : '•') : ''}
              </div>
            );
          })}
        </motion.div>
        <div className="flex justify-center mb-4">
          <button type="button" aria-pressed={showPin} onClick={() => setShowPin((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 min-h-[36px] text-xs font-medium text-secondary hover:text-primary rounded-md cursor-pointer">
            {showPin ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
            {showPin ? 'Hide PIN' : 'Show PIN'}
          </button>
        </div>

        <div className="text-center mb-4 flex items-center justify-center">
          {cardStatus.remainingAttempts < 3 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-subtle border border-warning/30 text-warning text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{cardStatus.remainingAttempts} attempts remaining before card lockout</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-tertiary">
              <Lock className="w-3 h-3" aria-hidden="true" />
              <span>3 attempts remaining • PIN entry is masked</span>
            </div>
          )}
        </div>

        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onSubmit={() => handleSubmitPin(pin)}
          submitLabel="Continue"
          submitDisabled={pin.length !== 4}
          isLoading={isLoading}
        />

        <div className="mt-4 text-center">
          <button type="button" onClick={() => { clearCard(); navigate('/'); }}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2 text-xs text-secondary hover:text-primary cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cancel and return card</span>
          </button>
        </div>
      </section>
    </div>
  );
};
