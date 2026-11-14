import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware } from '../context/HardwareContext';
import { api, getErrorMessage } from '../services/api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Keypad } from '../components/ui/Keypad';
import { ProgressRing } from '../components/ui/ProgressRing';
import { TransactionStepIndicator } from '../components/transactions/TransactionStepIndicator';
import { ATMTransition } from '../components/layout/ATMTransition';
import type { TransactionItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, AlertCircle, CheckCircle2, ArrowLeft, UserCheck, ShieldCheck, Printer } from 'lucide-react';

export const TransferPage: React.FC = () => {
  const [recipient, setRecipient] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [activeField, setActiveField] = useState<'RECIPIENT' | 'AMOUNT'>('RECIPIENT');
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const [countdown, setCountdown] = useState<number>(8);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<TransactionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { account, refreshBalance } = useAuth();
  const { printReceipt, registerKeypadListener, registerSideKeys } = useHardware();
  const navigate = useNavigate();

  const transferSteps = [
    { id: 1, label: 'Recipient & Amount' },
    { id: 2, label: 'Verify Beneficiary' },
    { id: 3, label: 'Transfer Complete' },
  ];
  const currentStep = completedTx ? 3 : isConfirmOpen || isLoading ? 2 : 1;

  const quickAmounts = [500, 1000, 2000, 5000];
  const availableBalance = account?.availableBalance ?? 0;

  // Auto-return countdown after completed transfer
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

  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    return `${accNum.slice(0, 3)}••••${accNum.slice(-4)}`;
  };

  useEffect(() => {
    if (completedTx) {
      return registerSideKeys({
        R1: {
          id: 'R1',
          label: 'Print Receipt',
          onClick: () => {
            printReceipt({
              transactionId: completedTx.transactionId,
              type: 'FUNDS TRANSFER (COPY)',
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
      L4: {
        id: 'L4',
        label: 'Back to Menu',
        onClick: () => navigate('/dashboard'),
      },
      R3: recipient && amountStr && parseFloat(amountStr) > 0 ? {
        id: 'R3',
        label: 'Initiate Transfer',
        onClick: () => handleInitiateTransfer(),
      } : null,
      R4: amountStr || recipient ? {
        id: 'R4',
        label: 'Clear Form',
        onClick: () => {
          setAmountStr('');
          setRecipient('');
        },
      } : null,
    });
  }, [registerSideKeys, completedTx, recipient, amountStr, account, printReceipt, navigate]);

  // Hardware keypad listener
  useEffect(() => {
    const unsubscribe = registerKeypadListener((key) => {
      if (isLoading || completedTx) return;
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
          handleExecuteTransfer();
        } else if (recipient && amountStr && parseFloat(amountStr) > 0) {
          handleInitiateTransfer();
        }
      }
    });
    return unsubscribe;
  }, [registerKeypadListener, isLoading, completedTx, isConfirmOpen, recipient, amountStr]);

  const demoRecipients = [
    { acc: 'ACC1001', name: 'Aarav Sharma' },
    { acc: 'ACC1002', name: 'Priya Patel' },
    { acc: 'ACC1003', name: 'Rahul Verma' },
    { acc: 'ACC1004', name: 'Neha Iyer' },
  ].filter((item) => item.acc !== account?.accountNumber);

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

  const handleInitiateTransfer = () => {
    const numericAmount = parseFloat(amountStr);
    if (!recipient.trim()) {
      setError('Please specify a destination account number.');
      return;
    }

    if (recipient.trim().toUpperCase() === account?.accountNumber?.toUpperCase()) {
      setError('Cannot transfer funds to your own account.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid transfer amount greater than zero.');
      return;
    }

    if (numericAmount > availableBalance) {
      setError(`Insufficient funds. Your available balance is ₹${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteTransfer = async () => {
    const numericAmount = parseFloat(amountStr);
    setIsLoading(true);
    setError(null);

    try {
      const record = await api.transfer(recipient.trim().toUpperCase(), numericAmount);
      await refreshBalance();
      setCompletedTx(record);
      setIsConfirmOpen(false);

      // Trigger thermal receipt generation
      printReceipt({
        transactionId: record.transactionId,
        type: 'FUNDS TRANSFER',
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
  const matchedRecipient = demoRecipients.find((r) => r.acc.toUpperCase() === recipient.trim().toUpperCase());

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
        <TransactionStepIndicator steps={transferSteps} currentStep={currentStep} />

        {/* Screen Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
            Electronic Transfer
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
            Funds Transfer
          </h1>
          <p className="text-xs text-secondary mt-1 font-mono flex items-center justify-center gap-2">
            <span>From: {maskAccountNumber(account?.accountNumber)}</span>
            <span>•</span>
            <span>Available: ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>

        <AnimatePresence mode="wait">
          {completedTx ? (
            /* Transfer Success View */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface-subdued border border-border-subtle text-center shadow-sm max-w-md mx-auto"
            >
              <div className="w-12 h-12 rounded-full bg-success-subtle text-success flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-semibold text-primary">Transfer Successful</h2>
              <p className="text-xs text-tertiary mt-1 font-mono">Ref: {completedTx.transactionId}</p>

              <div className="my-5 p-4 rounded-2xl bg-surface border border-border-subtle text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-tertiary">Transferred:</span>
                  <span className="font-semibold text-danger">
                    -₹{completedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-2">
                  <span className="text-tertiary">To Account:</span>
                  <span className="font-semibold text-primary">{recipient.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-2">
                  <span className="text-tertiary">Updated Balance:</span>
                  <span className="font-semibold text-primary">
                    ₹{completedTx.balanceAfterTransaction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Thermal confirmation slip prompt */}
              <div className="p-2.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center justify-center gap-2">
                <span>↓ Wire transfer confirmation slip ready below.</span>
              </div>

              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    printReceipt({
                      transactionId: completedTx.transactionId,
                      type: 'FUNDS TRANSFER (COPY)',
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
            /* Transfer Input View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Beneficiary Selection & Info */}
              <div className="space-y-4 min-w-0 w-full">
                {/* Beneficiary Account Input */}
                <div className="p-4 rounded-2xl bg-surface-subdued border border-border-subtle">
                  <label htmlFor="recipientInput" className="text-xs font-medium text-secondary block mb-1.5">
                    Beneficiary Account Number
                  </label>
                  <div className="relative">
                    <input
                      id="recipientInput"
                      ref={recipientInputRef}
                      type="text"
                      value={recipient}
                      onChange={(e) => {
                        setError(null);
                        setRecipient(e.target.value.toUpperCase());
                      }}
                      onFocus={() => setActiveField('RECIPIENT')}
                      placeholder="e.g. ACC1002"
                      maxLength={12}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border-subtle focus:border-accent font-mono text-sm uppercase placeholder:text-tertiary transition-colors outline-none"
                    />
                    <ArrowLeftRight className="w-4 h-4 text-tertiary absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Fast Select Demo Beneficiaries */}
                <div>
                  <span className="text-xs font-medium text-secondary block mb-2">
                    Quick Select Demo Beneficiary
                  </span>
                  <div className="space-y-1.5">
                    {demoRecipients.map((rec) => (
                      <button
                        key={rec.acc}
                        type="button"
                        onClick={() => {
                          setError(null);
                          setRecipient(rec.acc);
                          setActiveField('AMOUNT');
                        }}
                        className={`w-full min-h-[44px] p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                          recipient.toUpperCase() === rec.acc
                            ? 'bg-surface border-champagne text-champagne dark:border-accent dark:text-accent shadow-xs'
                            : 'bg-surface-subdued hover:bg-surface-hover border-border-subtle text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-secondary" />
                          <span className="font-mono font-medium">{rec.acc}</span>
                        </div>
                        <span className="text-secondary">{rec.name}</span>
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

              {/* Right Column: Amount Display, Quick Pills & Touch Keypad */}
              <div
                onClick={() => {
                  setActiveField('AMOUNT');
                  recipientInputRef.current?.blur();
                }}
                className="flex flex-col items-center min-w-0 w-full"
              >
                {/* Display Amount Box */}
                <div
                  tabIndex={0}
                  onFocus={() => {
                    setActiveField('AMOUNT');
                    recipientInputRef.current?.blur();
                  }}
                  className={`w-full max-w-[280px] p-3.5 mb-3 rounded-2xl bg-surface-subdued border transition-all cursor-pointer text-center outline-none ${
                    activeField === 'AMOUNT'
                      ? 'border-accent ring-1 ring-accent/30 shadow-xs'
                      : 'border-border-subtle hover:border-accent/40'
                  }`}
                  title="Click to enter amount via keypad"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase text-tertiary font-medium mb-0.5">
                    <span>Transfer Amount</span>
                    {activeField === 'AMOUNT' && (
                      <span className="text-accent font-semibold flex items-center gap-1 font-mono text-[9px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-mono font-semibold text-primary">
                    ₹{amountStr ? parseFloat(amountStr).toLocaleString('en-IN') : '0.00'}
                  </div>
                </div>

                {/* Fast Preset Amounts */}
                <div className="w-full max-w-[280px] mb-3">
                  <span className="text-[11px] font-medium text-secondary block mb-1.5">
                    Fast Cash Presets
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setError(null);
                          setAmountStr(amt.toString());
                          recipientInputRef.current?.blur();
                          setActiveField('AMOUNT');
                        }}
                        className={`min-h-[44px] py-2 px-2.5 rounded-xl border flex items-center justify-center font-mono text-xs font-medium transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
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

                {/* Touch Keypad */}
                <Keypad
                  onKeyPress={(num) => {
                    recipientInputRef.current?.blur();
                    setActiveField('AMOUNT');
                    handleKeyPress(num);
                  }}
                  onBackspace={() => {
                    recipientInputRef.current?.blur();
                    setActiveField('AMOUNT');
                    handleBackspace();
                  }}
                  onClear={() => {
                    recipientInputRef.current?.blur();
                    setActiveField('AMOUNT');
                    handleClear();
                  }}
                  onSubmit={handleInitiateTransfer}
                  submitLabel="Review Transfer"
                  submitDisabled={!amountStr || parseFloat(amountStr) <= 0 || !recipient.trim()}
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
          title={isLoading ? 'Transferring Funds' : 'Verify Electronic Transfer'}
        >
          {isLoading ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <ProgressRing
                stage="processing"
                stageLabel="Transferring Funds"
                size={110}
              />
              <p className="text-center font-sans text-xs text-secondary mt-4">
                Executing double-entry journal transfer in core banking ledger...
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-mono">
              <p className="text-secondary font-sans text-xs">
                Please verify recipient details before sending funds. This transfer executes immediately upon confirmation.
              </p>

              <div className="p-3.5 rounded-2xl bg-surface-subdued border border-border-subtle space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">From Account:</span>
                  <span className="text-primary font-medium">{account?.accountNumber} ({account?.fullName})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">To Beneficiary:</span>
                  <span className="text-accent font-semibold">{recipient.toUpperCase()}{matchedRecipient ? ` (${matchedRecipient.name})` : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">Available Balance:</span>
                  <span className="text-primary font-mono">
                    ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold border-t border-border-subtle pt-2">
                  <span className="text-primary">Transfer Amount:</span>
                  <span className="text-danger font-mono font-bold">
                    -₹{parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-secondary">
                  <span className="text-tertiary">Est. Remaining Balance:</span>
                  <span className="text-primary font-mono">
                    ₹{estRemainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Transparent Fee Disclosure */}
              <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between text-[11px]">
                <span className="text-tertiary flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  Intra-Bank Transfer Fee:
                </span>
                <span className="font-semibold text-success">
                  ₹0.00 (Zero Network Fee)
                </span>
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
                  onClick={handleExecuteTransfer}
                  className="flex-1 font-sans"
                >
                  Confirm & Send
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ATMTransition>
  );
};
