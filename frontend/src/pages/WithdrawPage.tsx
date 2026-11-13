import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getErrorMessage } from '../services/api';
import { Keypad } from '../components/ui/Keypad';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ATMTransition } from '../components/layout/ATMTransition';
import type { TransactionItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const WithdrawPage: React.FC = () => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [completedTx, setCompletedTx] = useState<TransactionItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { account, refreshBalance } = useAuth();
  const navigate = useNavigate();

  const quickAmounts = [500, 1000, 2000, 5000, 10000];
  const availableBalance = account?.availableBalance ?? 0;

  const handleKeyPress = (num: string) => {
    setError(null);
    if (amountStr.length < 7) {
      setAmountStr((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setError(null);
    setAmountStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setAmountStr('');
  };

  const handleQuickSelect = (amt: number) => {
    setError(null);
    setAmountStr(amt.toString());
  };

  const handleOpenConfirm = () => {
    const numericAmount = parseFloat(amountStr);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid withdrawal amount greater than zero.');
      return;
    }

    if (numericAmount > availableBalance) {
      setError(
        `Insufficient available funds. You can withdraw up to ₹${availableBalance.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}.`
      );
      return;
    }

    if (numericAmount % 100 !== 0) {
      setError('Withdrawal amounts must be in multiples of ₹100.');
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteWithdrawal = async () => {
    const numericAmount = parseFloat(amountStr);
    setIsLoading(true);
    setError(null);
    setIsConfirmOpen(false);

    try {
      const record = await api.withdraw(numericAmount);
      await refreshBalance();
      setCompletedTx(record);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ATMTransition>
      <div className="max-w-2xl mx-auto py-2">
        {/* Screen Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
            Cash Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
            Cash Withdrawal
          </h1>
          <p className="text-xs text-secondary mt-1 font-mono">
            Available: ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Min Balance Enforced)
          </p>
        </div>

        <AnimatePresence mode="wait">
          {completedTx ? (
            /* Withdrawal Dispensed Success View */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface-subdued border border-border-subtle text-center shadow-sm max-w-md mx-auto"
            >
              {/* Dispenser Slot Delivery Simulation */}
              <div className="w-56 h-7 bg-surface rounded-xl border border-border-subtle mx-auto mb-4 flex items-center justify-center shadow-inner relative overflow-hidden">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.45 }}
                  className="w-40 h-4 bg-emerald-600/30 border border-emerald-500/50 rounded flex items-center justify-center text-[9px] font-mono font-medium text-emerald-400"
                >
                  DISPENSING CURRENCY
                </motion.div>
              </div>

              <div className="w-12 h-12 rounded-full bg-success-subtle text-success flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-semibold text-primary">Cash Dispensed</h2>
              <p className="text-xs text-tertiary mt-1 font-mono">Ref: {completedTx.transactionId}</p>

              <div className="my-6 p-4 rounded-2xl bg-surface border border-border-subtle text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-tertiary">Amount Dispensed:</span>
                  <span className="font-semibold text-primary">
                    ₹{completedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-2">
                  <span className="text-tertiary">Remaining Balance:</span>
                  <span className="font-semibold text-primary">
                    ₹{completedTx.balanceAfterTransaction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setCompletedTx(null);
                    setAmountStr('');
                  }}
                  className="flex-1"
                >
                  Withdraw More
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Dashboard
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Withdrawal Input View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Quick Pills & Dispenser Status */}
              <div className="space-y-4">
                {/* Dispenser Slot Indicator */}
                <div className="p-4 rounded-2xl bg-surface-subdued border border-border-subtle">
                  <div className="flex items-center justify-between text-xs text-secondary mb-2">
                    <span className="font-medium">Cash Dispenser Shutter</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="w-full h-8 bg-surface rounded-xl border border-border-subtle flex items-center justify-center shadow-inner">
                    <div className="w-32 h-1 bg-border-strong rounded-full opacity-60" />
                  </div>
                  <p className="text-[11px] text-tertiary mt-2">
                    Dispenses in denominations of ₹500 and ₹100.
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-medium text-secondary block mb-2">
                    Fast Cash Amounts
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickSelect(amt)}
                        className={`py-2.5 px-3 rounded-xl border text-center font-mono text-xs font-medium transition-colors cursor-pointer select-none ${
                          amountStr === amt.toString()
                            ? 'bg-surface border-accent text-accent shadow-xs'
                            : 'bg-surface-subdued hover:bg-surface-hover border-border-subtle text-primary'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
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

              {/* Right Column: Active Amount & Keypad */}
              <div className="flex flex-col items-center">
                {/* Display Amount Box */}
                <div className="w-full max-w-[280px] p-3.5 mb-4 rounded-2xl bg-surface-subdued border border-border-subtle text-center">
                  <span className="text-[10px] uppercase text-tertiary block font-medium">
                    Withdrawal Amount
                  </span>
                  <div className="text-2xl font-mono font-semibold text-primary mt-0.5">
                    ₹{amountStr ? parseFloat(amountStr).toLocaleString('en-IN') : '0.00'}
                  </div>
                </div>

                {/* Touch Keypad */}
                <Keypad
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  onSubmit={handleOpenConfirm}
                  submitLabel="Dispense Cash"
                  submitDisabled={!amountStr || parseFloat(amountStr) <= 0}
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

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Cash Withdrawal"
        >
          <div className="space-y-4 text-xs font-mono">
            <p className="text-secondary font-sans text-xs">
              Please verify your withdrawal request before dispensing currency notes.
            </p>

            <div className="p-3 rounded-xl bg-surface-subdued border border-border-subtle space-y-2">
              <div className="flex justify-between">
                <span className="text-tertiary">From Account:</span>
                <span className="text-primary font-medium">{account?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tertiary">Available Balance:</span>
                <span className="text-primary">
                  ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border-subtle pt-2">
                <span className="text-primary">Withdrawal Amount:</span>
                <span className="text-primary font-mono">
                  ₹{parseFloat(amountStr || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 font-sans"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleExecuteWithdrawal}
                isLoading={isLoading}
                className="flex-1 font-sans"
              >
                Confirm & Dispense
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ATMTransition>
  );
};
