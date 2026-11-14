import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { api, getErrorMessage } from '../services/api';
import { Keypad } from '../components/ui/Keypad';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressRing } from '../components/ui/ProgressRing';
import { TransactionStepIndicator } from '../components/transactions/TransactionStepIndicator';
import { ATMTransition } from '../components/layout/ATMTransition';
import type { TransactionItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, ArrowLeft, Printer, ShieldCheck, Banknote } from 'lucide-react';

export const WithdrawPage: React.FC = () => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [completedTx, setCompletedTx] = useState<TransactionItem | null>(null);
  const [countdown, setCountdown] = useState<number>(8);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { account, refreshBalance } = useAuth();
  const { t } = useLanguage();
  const { triggerDispense, printReceipt, registerKeypadListener, registerSideKeys } = useHardware();
  const navigate = useNavigate();

  const withdrawSteps = [
    { id: 1, label: 'Select Amount' },
    { id: 2, label: 'Review Details' },
    { id: 3, label: 'Cash Dispensed' },
  ];
  const currentStep = completedTx ? 3 : isConfirmOpen || isLoading ? 2 : 1;

  // Auto-return countdown after completed withdrawal
  useEffect(() => {
    if (!completedTx) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [completedTx, navigate]);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];
  const availableBalance = account?.availableBalance ?? 0;

  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    return `${accNum.slice(0, 3)}••••${accNum.slice(-4)}`;
  };

  // Register physical side function keys on ATM chassis
  useEffect(() => {
    if (completedTx) {
      return registerSideKeys({
        R1: {
          id: 'R1',
          label: 'Print Receipt',
          onClick: () => {
            printReceipt({
              transactionId: completedTx.transactionId,
              type: 'CASH WITHDRAWAL (COPY)',
              amount: completedTx.amount,
              balanceAfter: completedTx.balanceAfterTransaction,
              timestamp: completedTx.timestamp,
              accountNumber: account?.accountNumber || 'ACC1001',
              cardHolderName: account?.fullName,
            });
          },
        },
        R4: {
          id: 'R4',
          label: 'Return to Dashboard',
          onClick: () => navigate('/dashboard'),
        },
      });
    }

    return registerSideKeys({
      L1: {
        id: 'L1',
        label: '₹500',
        onClick: () => handleQuickSelect(500),
      },
      L2: {
        id: 'L2',
        label: '₹1,000',
        onClick: () => handleQuickSelect(1000),
      },
      L3: {
        id: 'L3',
        label: '₹2,000',
        onClick: () => handleQuickSelect(2000),
      },
      L4: {
        id: 'L4',
        label: 'Back to Menu',
        onClick: () => navigate('/dashboard'),
      },
      R1: {
        id: 'R1',
        label: '₹5,000',
        onClick: () => handleQuickSelect(5000),
      },
      R2: {
        id: 'R2',
        label: '₹10,000',
        onClick: () => handleQuickSelect(10000),
      },
      R3: amountStr && parseFloat(amountStr) > 0 ? {
        id: 'R3',
        label: 'Confirm Withdraw',
        onClick: () => handleOpenConfirm(),
      } : null,
      R4: amountStr ? {
        id: 'R4',
        label: 'Clear Amount',
        onClick: () => handleClear(),
      } : null,
    });
  }, [registerSideKeys, completedTx, amountStr, account, printReceipt, navigate]);

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

  // Physical Keypad Listener for Custom Amount Entry
  useEffect(() => {
    const unsubscribe = registerKeypadListener((key) => {
      if (completedTx) {
        if (key === 'ENTER' || key === 'CANCEL') {
          navigate('/dashboard');
        }
        return;
      }
      if (isLoading) return;
      if (/^[0-9]$/.test(key)) {
        handleKeyPress(key);
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      } else if (key === 'CLEAR') {
        handleClear();
      } else if (key === 'CANCEL') {
        if (isConfirmOpen) {
          setIsConfirmOpen(false);
        } else {
          navigate('/dashboard');
        }
      } else if (key === 'ENTER') {
        if (isConfirmOpen) {
          handleExecuteWithdrawal();
        } else if (amountStr && parseFloat(amountStr) > 0) {
          handleOpenConfirm();
        }
      }
    });
    return unsubscribe;
  }, [registerKeypadListener, isLoading, completedTx, isConfirmOpen, amountStr, navigate]);

  const handleExecuteWithdrawal = async () => {
    const numericAmount = parseFloat(amountStr);
    setIsLoading(true);
    setError(null);

    try {
      const record = await api.withdraw(numericAmount);
      await refreshBalance();
      setCompletedTx(record);
      setIsConfirmOpen(false);

      // Trigger the motorized physical note dispenser below
      const breakdown = record.denominations || {
        500: Math.floor(numericAmount / 500),
        200: Math.floor((numericAmount % 500) / 200),
        100: Math.floor(((numericAmount % 500) % 200) / 100),
      };
      triggerDispense(numericAmount, breakdown);

      // Trigger thermal receipt generation
      printReceipt({
        transactionId: record.transactionId,
        type: 'CASH WITHDRAWAL',
        amount: record.amount,
        balanceAfter: record.balanceAfterTransaction,
        timestamp: record.timestamp || new Date().toISOString(),
        accountNumber: account?.accountNumber || 'ACC1001',
        cardHolderName: account?.fullName,
      });
    } catch (err) {
      setIsConfirmOpen(false);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const parsedAmount = parseFloat(amountStr || '0');
  const estRemainingBalance = Math.max(0, availableBalance - parsedAmount);

  return (
    <ATMTransition>
      <div className="max-w-2xl mx-auto py-2">
        {/* Top Navigation Bar */}
        {!completedTx && (
          <div className="sticky top-0 z-20 flex items-center justify-between pb-3 mb-4 bg-surface/95 backdrop-blur-xs border-b border-border-subtle">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 font-medium cursor-pointer shadow-xs hover:border-accent hover:text-accent"
            >
              <ArrowLeft className="w-4 h-4 text-accent" />
              <span>Return to Dashboard</span>
            </Button>

            <span className="text-[11px] font-mono text-tertiary hidden xs:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface-subdued border border-border-subtle text-primary font-bold">Esc</kbd> or <strong className="text-accent font-bold">L4</strong>
            </span>
          </div>
        )}

        {/* Standardized Horizontal Step Indicator */}
        <TransactionStepIndicator steps={withdrawSteps} currentStep={currentStep} />

        {/* Screen Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
            Cash Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
            Cash Withdrawal
          </h1>
          <p className="text-xs text-secondary mt-1 font-mono flex items-center justify-center gap-2">
            <span>Account: {maskAccountNumber(account?.accountNumber)}</span>
            <span>•</span>
            <span>Available: ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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

              <h2 className="text-xl font-semibold text-primary">{t('withdraw.title')}</h2>
              <p className="text-xs text-tertiary mt-1 font-mono">Ref: {completedTx.transactionId}</p>

              {/* Note Breakdown Badges */}
              {completedTx.denominations && Object.keys(completedTx.denominations).length > 0 && (
                <div className="my-3 flex flex-wrap justify-center gap-2">
                  {Object.entries(completedTx.denominations).map(([denom, count]) => (
                    <span
                      key={denom}
                      className="px-2.5 py-1 rounded-lg bg-surface border border-accent/30 font-mono text-xs font-semibold text-accent shadow-xs flex items-center gap-1.5"
                    >
                      <span>₹{denom}</span>
                      <span className="text-[10px] text-secondary">× {String(count)}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="my-5 p-4 rounded-2xl bg-surface border border-border-subtle text-xs font-mono space-y-2">
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

              {/* Prompt to collect from hardware bay */}
              <div className="p-2.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center justify-center gap-2">
                <span>↓ Please collect your notes and receipt from the console below.</span>
              </div>

              <div className="flex gap-2.5">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    printReceipt({
                      transactionId: completedTx.transactionId,
                      type: 'CASH WITHDRAWAL (COPY)',
                      amount: completedTx.amount,
                      balanceAfter: completedTx.balanceAfterTransaction,
                      timestamp: completedTx.timestamp,
                      accountNumber: account?.accountNumber || 'ACC1001',
                      cardHolderName: account?.fullName,
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 font-semibold"
                >
                  Return to Dashboard ({countdown}s)
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Withdrawal Input View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Quick Pills & Dispenser Status */}
              <div className="space-y-4 min-w-0 w-full">
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
                        className={`min-h-[44px] py-2.5 px-3 rounded-xl border flex items-center justify-center font-mono text-xs font-medium transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                          amountStr === amt.toString()
                            ? 'bg-surface border-champagne text-champagne dark:border-accent dark:text-accent shadow-xs'
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
                      className="p-3 rounded-xl bg-danger-subtle border border-danger/20 text-danger text-xs flex items-start gap-2 max-w-full overflow-hidden"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="break-words break-all text-xs leading-relaxed">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Active Amount & Keypad */}
              <div className="flex flex-col items-center min-w-0 w-full">
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
                  submitLabel="Review Withdrawal"
                  submitDisabled={!amountStr || parseFloat(amountStr) <= 0}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Back Link (shown only during input mode) */}
        {!completedTx && (
          <div className="mt-8 text-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </Button>
          </div>
        )}

        {/* Pre-Execution Review Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => {
            if (!isLoading) setIsConfirmOpen(false);
          }}
          title={isLoading ? 'Processing Dispensation' : 'Review Withdrawal Details'}
        >
          {isLoading ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <ProgressRing
                stage="processing"
                stageLabel="Dispensing Currency"
                size={110}
              />
              <p className="text-center font-sans text-xs text-secondary mt-4">
                Connecting to cash vault and preparing currency notes...
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              <p className="text-secondary font-sans text-xs">
                Please verify your cash withdrawal request before dispensing currency notes.
              </p>

              <div className="p-3.5 rounded-2xl bg-surface-subdued border border-border-subtle space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">From Account:</span>
                  <span className="text-primary font-medium">{account?.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">Available Balance:</span>
                  <span className="text-primary">
                    ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold border-t border-border-subtle pt-2">
                  <span className="text-primary">Withdrawal Amount:</span>
                  <span className="text-primary font-mono font-bold">
                    ₹{parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-secondary">
                  <span className="text-tertiary">Remaining Balance:</span>
                  <span className="text-primary font-mono">
                    ₹{estRemainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Note Breakdown Estimate & Zero Fee Disclosure */}
              <div className="p-3 rounded-xl bg-surface border border-border-subtle space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-tertiary flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-accent" />
                    Estimated Note Breakdown:
                  </span>
                  <span className="font-semibold text-primary">
                    {Math.floor(parsedAmount / 500) > 0 && `₹500 × ${Math.floor(parsedAmount / 500)}`}
                    {Math.floor((parsedAmount % 500) / 100) > 0 && ` + ₹100 × ${Math.floor((parsedAmount % 500) / 100)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] border-t border-border-subtle/50 pt-1.5">
                  <span className="text-tertiary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    ATM Network Surcharge:
                  </span>
                  <span className="font-semibold text-success">
                    ₹0.00 (Zero Network Fee)
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
                  className="flex-1 font-sans"
                >
                  Confirm & Dispense
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ATMTransition>
  );
};
