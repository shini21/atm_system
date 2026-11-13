import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware } from '../context/HardwareContext';
import { api, getErrorMessage } from '../services/api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Keypad } from '../components/ui/Keypad';
import { ATMTransition } from '../components/layout/ATMTransition';
import type { TransactionItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, AlertCircle, CheckCircle2, ArrowLeft, UserCheck } from 'lucide-react';

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

  const quickAmounts = [500, 1000, 2000, 5000];

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
    setError(null);
    const rec = recipient.trim().toUpperCase();
    const amt = parseFloat(amountStr);

    if (!rec) {
      setError('Please specify a recipient account number.');
      return;
    }

    if (rec === account?.accountNumber) {
      setError('Cannot transfer money to your own account.');
      return;
    }

    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid transfer amount greater than zero.');
      return;
    }

    if (amt > (account?.availableBalance ?? 0)) {
      setError(
        `Transfer amount exceeds available balance of ₹${(account?.availableBalance ?? 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}.`
      );
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteTransfer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const record = await api.transfer(recipient.trim().toUpperCase(), parseFloat(amountStr));
      await refreshBalance();
      setIsConfirmOpen(false);
      setCompletedTx(record);

      // Trigger thermal receipt generation
      printReceipt({
        transactionId: record.transactionId,
        type: `TRANSFER TO ${recipient.trim().toUpperCase()}`,
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

  return (
    <ATMTransition>
      <div className="max-w-2xl mx-auto py-2">
        {/* Top Navigation Bar */}
        {!completedTx && (
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
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

        {/* Screen Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
            Electronic Transfer
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
            Transfer Funds
          </h1>
          <p className="text-xs text-secondary mt-1 font-mono">
            Sender: {account?.fullName} ({maskAccountNumber(account?.accountNumber)}) • Available: ₹{(account?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

              <h2 className="text-xl font-semibold text-primary">Transfer Completed</h2>
              <p className="text-xs text-tertiary mt-1 font-mono">Ref: {completedTx.transactionId}</p>

              <div className="my-6 p-4 rounded-2xl bg-surface border border-border-subtle text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-tertiary">Transferred:</span>
                  <span className="font-semibold text-primary">
                    -₹{completedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary">Recipient:</span>
                  <span className="font-semibold text-primary">{recipient.toUpperCase()}</span>
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
                    setRecipient('');
                    setAmountStr('');
                  }}
                  className="flex-1"
                >
                  New Transfer
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
            /* Transfer Input Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Recipient Selection & Presets */}
              <div className="space-y-4 min-w-0 w-full">
                {/* Recipient Account Input Box */}
                <div
                  onClick={() => {
                    setActiveField('RECIPIENT');
                    recipientInputRef.current?.focus();
                  }}
                  className={`p-4 rounded-2xl bg-surface-subdued border transition-all cursor-text space-y-3 ${
                    activeField === 'RECIPIENT'
                      ? 'border-accent ring-1 ring-accent/30 shadow-xs'
                      : 'border-border-subtle hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-secondary flex items-center gap-1.5">
                      <span>Recipient Account Number</span>
                      {activeField === 'RECIPIENT' && (
                        <span className="text-[9px] font-mono font-semibold uppercase text-accent">
                          • Typing
                        </span>
                      )}
                    </label>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-tertiary" />
                  </div>

                  <input
                    ref={recipientInputRef}
                    type="text"
                    value={recipient}
                    onFocus={() => setActiveField('RECIPIENT')}
                    onChange={(e) => setRecipient(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        e.preventDefault();
                        recipientInputRef.current?.blur();
                        setActiveField('AMOUNT');
                      }
                    }}
                    placeholder="e.g. ACC1002"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-subtle focus:border-accent text-primary font-mono text-sm tracking-wider outline-none placeholder:text-tertiary"
                  />

                  {/* Quick Select Recipients */}
                  <div>
                    <span className="text-[11px] font-medium text-tertiary block mb-1.5">
                      Classroom Test Accounts:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {demoRecipients.map((d) => (
                        <button
                          key={d.acc}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecipient(d.acc);
                            recipientInputRef.current?.blur();
                            setActiveField('AMOUNT');
                          }}
                          className={`py-2 px-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between cursor-pointer select-none ${
                            recipient === d.acc
                              ? 'bg-surface border-accent text-accent shadow-2xs'
                              : 'bg-surface hover:bg-surface-hover border-border-subtle text-primary'
                          }`}
                        >
                          <span className="font-mono font-medium">{d.acc}</span>
                          <span className="text-[11px] text-secondary flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-tertiary" />
                            {d.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Balance Status */}
                <div className="p-3.5 rounded-2xl bg-surface-subdued border border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-tertiary">Available Balance:</span>
                  <span className="font-mono font-semibold text-primary">
                    ₹{(account?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
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
                        className={`py-2 px-2.5 rounded-xl border text-center font-mono text-xs font-medium transition-colors cursor-pointer select-none ${
                          amountStr === amt.toString()
                            ? 'bg-surface border-accent text-accent shadow-2xs'
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

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Electronic Transfer"
        >
          <div className="space-y-4 text-xs font-mono">
            <p className="text-secondary font-sans text-xs">
              Please verify recipient details before sending funds. This transaction is irrevocable once confirmed.
            </p>

            <div className="p-3.5 rounded-xl bg-surface-subdued border border-border-subtle space-y-2">
              <div className="flex justify-between">
                <span className="text-tertiary">From Account:</span>
                <span className="text-primary font-medium">{account?.accountNumber} ({account?.fullName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tertiary">To Account:</span>
                <span className="text-accent font-semibold">{recipient.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tertiary">Transfer Fee:</span>
                <span className="text-success font-medium">₹0.00 (Zero Fee)</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border-subtle pt-2">
                <span className="text-primary">Transfer Amount:</span>
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
                onClick={handleExecuteTransfer}
                isLoading={isLoading}
                className="flex-1 font-sans"
              >
                Confirm & Send
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ATMTransition>
  );
};
