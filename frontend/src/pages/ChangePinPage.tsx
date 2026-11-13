import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api';
import { Keypad } from '../components/ui/Keypad';
import { Button } from '../components/ui/Button';
import { ATMTransition } from '../components/layout/ATMTransition';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

type ActiveField = 'CURRENT' | 'NEW' | 'CONFIRM';

export const ChangePinPage: React.FC = () => {
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [activeField, setActiveField] = useState<ActiveField>('CURRENT');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleKeyPress = (num: string) => {
    setError(null);
    if (activeField === 'CURRENT') {
      if (currentPin.length < 4) {
        const next = currentPin + num;
        setCurrentPin(next);
        if (next.length === 4) setActiveField('NEW');
      }
    } else if (activeField === 'NEW') {
      if (newPin.length < 4) {
        const next = newPin + num;
        setNewPin(next);
        if (next.length === 4) setActiveField('CONFIRM');
      }
    } else if (activeField === 'CONFIRM') {
      if (confirmPin.length < 4) {
        setConfirmPin((prev) => prev + num);
      }
    }
  };

  const handleBackspace = () => {
    setError(null);
    if (activeField === 'CONFIRM') {
      if (confirmPin.length > 0) {
        setConfirmPin((prev) => prev.slice(0, -1));
      } else {
        setActiveField('NEW');
      }
    } else if (activeField === 'NEW') {
      if (newPin.length > 0) {
        setNewPin((prev) => prev.slice(0, -1));
      } else {
        setActiveField('CURRENT');
      }
    } else if (activeField === 'CURRENT') {
      setCurrentPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setError(null);
    if (activeField === 'CURRENT') setCurrentPin('');
    else if (activeField === 'NEW') setNewPin('');
    else if (activeField === 'CONFIRM') setConfirmPin('');
  };

  const handleSubmit = async () => {
    setError(null);

    if (currentPin.length !== 4) {
      setError('Please enter your complete 4-digit current PIN.');
      setActiveField('CURRENT');
      return;
    }

    if (newPin.length !== 4) {
      setError('Please enter a new 4-digit PIN.');
      setActiveField('NEW');
      return;
    }

    if (confirmPin.length !== 4) {
      setError('Please confirm your new 4-digit PIN.');
      setActiveField('CONFIRM');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and confirmation PIN do not match.');
      setConfirmPin('');
      setActiveField('CONFIRM');
      return;
    }

    if (newPin === currentPin) {
      setError('Your new PIN must be different from your current PIN.');
      setNewPin('');
      setConfirmPin('');
      setActiveField('NEW');
      return;
    }

    setIsLoading(true);
    try {
      await api.changePin(currentPin, newPin, confirmPin);
      setIsSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const renderPinDots = (val: string, isActive: boolean) => {
    return (
      <div className="flex items-center gap-2.5">
        {[0, 1, 2, 3].map((idx) => {
          const filled = idx < val.length;
          return (
            <motion.div
              key={idx}
              animate={{
                scale: filled ? [1, 1.25, 1] : 1,
              }}
              transition={{ duration: 0.15 }}
              className={`w-3 h-3 rounded-full transition-colors ${
                filled
                  ? 'bg-primary'
                  : isActive
                  ? 'bg-surface border-2 border-border-strong'
                  : 'bg-surface-subdued border border-border-subtle'
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <ATMTransition>
      <div className="max-w-xl mx-auto py-2">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
            Security & Authentication
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
            Change Card PIN
          </h1>
          <p className="text-xs text-secondary mt-1">
            Update your 4-digit security code for ATM access.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            /* Success View */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface-subdued border border-border-subtle text-center shadow-sm max-w-md mx-auto"
            >
              <div className="w-12 h-12 rounded-full bg-success-subtle text-success flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-semibold text-primary">PIN Updated Successfully</h2>
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                Your new security PIN is now active. Please use your new PIN for future terminal sessions.
              </p>

              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
                className="mt-6 w-full"
              >
                Return to Dashboard
              </Button>
            </motion.div>
          ) : (
            /* PIN Input Form */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: 3 PIN Fields */}
              <div className="space-y-3">
                {/* Field 1: Current PIN */}
                <div
                  onClick={() => setActiveField('CURRENT')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeField === 'CURRENT'
                      ? 'bg-surface border-accent shadow-2xs'
                      : 'bg-surface-subdued border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-secondary">
                      Current 4-Digit PIN
                    </span>
                    {activeField === 'CURRENT' && (
                      <span className="text-[10px] uppercase font-semibold text-accent font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {renderPinDots(currentPin, activeField === 'CURRENT')}
                    <span className="text-xs font-mono text-tertiary">
                      {currentPin.length}/4
                    </span>
                  </div>
                </div>

                {/* Field 2: New PIN */}
                <div
                  onClick={() => setActiveField('NEW')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeField === 'NEW'
                      ? 'bg-surface border-accent shadow-2xs'
                      : 'bg-surface-subdued border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-secondary">
                      New 4-Digit PIN
                    </span>
                    {activeField === 'NEW' && (
                      <span className="text-[10px] uppercase font-semibold text-accent font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {renderPinDots(newPin, activeField === 'NEW')}
                    <span className="text-xs font-mono text-tertiary">
                      {newPin.length}/4
                    </span>
                  </div>
                </div>

                {/* Field 3: Confirm PIN */}
                <div
                  onClick={() => setActiveField('CONFIRM')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeField === 'CONFIRM'
                      ? 'bg-surface border-accent shadow-2xs'
                      : 'bg-surface-subdued border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-secondary">
                      Confirm New PIN
                    </span>
                    {activeField === 'CONFIRM' && (
                      <span className="text-[10px] uppercase font-semibold text-accent font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {renderPinDots(confirmPin, activeField === 'CONFIRM')}
                    <span className="text-xs font-mono text-tertiary">
                      {confirmPin.length}/4
                    </span>
                  </div>
                </div>

                {/* Security Note */}
                <div className="p-3 rounded-xl bg-surface-subdued border border-border-subtle text-[11px] text-tertiary flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <p>
                    Never share your PIN with anyone. Apex bank staff will never ask for your card PIN.
                  </p>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-danger-subtle border border-danger/20 text-danger text-xs flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Keypad */}
              <div className="flex flex-col items-center">
                <Keypad
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  onSubmit={handleSubmit}
                  submitLabel="Update PIN"
                  submitDisabled={
                    currentPin.length !== 4 ||
                    newPin.length !== 4 ||
                    confirmPin.length !== 4
                  }
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors cursor-pointer select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </ATMTransition>
  );
};
