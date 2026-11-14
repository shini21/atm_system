import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware, type ReceiptData } from '../context/HardwareContext';
import { api, getErrorMessage } from '../services/api';
import type { TransactionItem as TransactionItemType } from '../types';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { ATMTransition } from '../components/layout/ATMTransition';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Printer,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';

type FilterType = 'ALL' | 'WITHDRAWALS' | 'DEPOSITS' | 'TRANSFERS' | 'PIN_CHANGE';

interface DateGroup {
  key: string;
  label: string;
  items: TransactionItemType[];
}

export const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItemType[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<TransactionItemType | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const { account } = useAuth();
  const { printReceipt, registerSideKeys } = useHardware();
  const navigate = useNavigate();

  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    return `${accNum.slice(0, 3)}••••${accNum.slice(-4)}`;
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Backend provides full ledger statement (up to 20 recent operations)
      const data = await api.getRecentTransactions(20);
      setTransactions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Register physical side function keys on ATM chassis
  useEffect(() => {
    return registerSideKeys({
      L4: {
        id: 'L4',
        label: 'Back to Menu',
        onClick: () => navigate('/dashboard'),
      },
      R1: {
        id: 'R1',
        label: 'Print Statement',
        onClick: () => {
          const latest = transactions[0];
          printReceipt({
            transactionId: `STMT-${Date.now().toString().slice(-6)}`,
            type: 'MINI STATEMENT',
            amount: latest ? latest.amount : 0,
            balanceAfter: account?.availableBalance || 0,
            timestamp: new Date().toISOString(),
            accountNumber: account?.accountNumber || 'ACC1001',
            cardHolderName: account?.fullName,
          });
        },
      },
      R2: {
        id: 'R2',
        label: 'Refresh',
        onClick: fetchHistory,
      },
      R3: {
        id: 'R3',
        label: 'Cycle Filter',
        onClick: () => {
          setFilter((prev) => {
            if (prev === 'ALL') return 'WITHDRAWALS';
            if (prev === 'WITHDRAWALS') return 'DEPOSITS';
            if (prev === 'DEPOSITS') return 'TRANSFERS';
            if (prev === 'TRANSFERS') return 'PIN_CHANGE';
            return 'ALL';
          });
        },
      },
    });
  }, [registerSideKeys, transactions, account, printReceipt, navigate]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter === 'ALL') return true;
      if (filter === 'WITHDRAWALS') return tx.type === 'WITHDRAWAL';
      if (filter === 'DEPOSITS') return tx.type === 'DEPOSIT';
      if (filter === 'TRANSFERS') return tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT';
      if (filter === 'PIN_CHANGE') return tx.type === 'PIN_CHANGE';
      return true;
    });
  }, [transactions, filter]);

  // Date Grouping logic: Today, Yesterday, Earlier Dates
  const groupedTransactions = useMemo<DateGroup[]>(() => {
    if (filteredTransactions.length === 0) return [];

    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const groupsMap = new Map<string, { label: string; items: TransactionItemType[] }>();

    filteredTransactions.forEach((tx) => {
      let groupKey: string;
      let groupLabel: string;

      try {
        const txDate = new Date(tx.timestamp);
        const txDateStr = txDate.toDateString();

        if (txDateStr === todayStr) {
          groupKey = 'today';
          groupLabel = 'Today';
        } else if (txDateStr === yesterdayStr) {
          groupKey = 'yesterday';
          groupLabel = 'Yesterday';
        } else {
          // Format specific date: e.g. "12 Nov 2026"
          groupKey = txDateStr;
          groupLabel = new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(txDate);
        }
      } catch {
        groupKey = 'recent';
        groupLabel = 'Recent Activity';
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, { label: groupLabel, items: [] });
      }
      groupsMap.get(groupKey)!.items.push(tx);
    });

    return Array.from(groupsMap.entries()).map(([key, val]) => ({
      key,
      label: val.label,
      items: val.items,
    }));
  }, [filteredTransactions]);

  // Badge count calculation for each filter tab
  const counts = useMemo(() => {
    return {
      ALL: transactions.length,
      WITHDRAWALS: transactions.filter((t) => t.type === 'WITHDRAWAL').length,
      DEPOSITS: transactions.filter((t) => t.type === 'DEPOSIT').length,
      TRANSFERS: transactions.filter((t) => t.type === 'TRANSFER_IN' || t.type === 'TRANSFER_OUT').length,
      PIN_CHANGE: transactions.filter((t) => t.type === 'PIN_CHANGE').length,
    };
  }, [transactions]);

  const filterButtons: { label: string; value: FilterType; count: number }[] = [
    { label: 'All Operations', value: 'ALL', count: counts.ALL },
    { label: 'Cash Withdrawals', value: 'WITHDRAWALS', count: counts.WITHDRAWALS },
    { label: 'Deposits', value: 'DEPOSITS', count: counts.DEPOSITS },
    { label: 'Transfers', value: 'TRANSFERS', count: counts.TRANSFERS },
    { label: 'Security & PIN', value: 'PIN_CHANGE', count: counts.PIN_CHANGE },
  ];

  const handleCopyRef = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setIsCopied(refId);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handlePrintIndividualReceipt = (tx: TransactionItemType) => {
    const receiptData: ReceiptData = {
      transactionId: tx.transactionId,
      type: tx.type.replace('_', ' '),
      amount: tx.amount,
      balanceAfter: tx.balanceAfterTransaction ?? account?.availableBalance ?? 0,
      timestamp: tx.timestamp,
      accountNumber: account?.accountNumber || 'ACC1001',
      cardHolderName: account?.fullName,
    };
    printReceipt(receiptData);
    setSelectedTxForReceipt(tx);
  };

  return (
    <ATMTransition>
      <div className="max-w-3xl mx-auto py-2">
        {/* Top Navigation Bar */}
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

        {/* Header with Ledger Title and Print Slip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
                Activity Ledger
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent/15 text-accent border border-accent/30">
                Core Banking Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
              Transaction History
            </h1>
            <p className="text-xs text-secondary mt-1 font-mono">
              Account: {maskAccountNumber(account?.accountNumber)} • {account?.accountType} • Ledger Currency: INR (₹)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const latest = transactions[0];
                printReceipt({
                  transactionId: `STMT-${Date.now().toString().slice(-6)}`,
                  type: 'MINI STATEMENT',
                  amount: latest ? latest.amount : 0,
                  balanceAfter: account?.availableBalance || 0,
                  timestamp: new Date().toISOString(),
                  accountNumber: account?.accountNumber || 'ACC1001',
                  cardHolderName: account?.fullName,
                });
              }}
              icon={<Printer className="w-3.5 h-3.5 text-accent" />}
            >
              Print Statement
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchHistory}
              isLoading={isLoading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Chips with Real Badge Counts */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-subdued border border-border-subtle mb-6 overflow-x-auto no-scrollbar">
          {filterButtons.map((btn) => {
            const isActive = filter === btn.value;
            return (
              <button
                key={btn.value}
                type="button"
                onClick={() => setFilter(btn.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap select-none flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-surface text-primary shadow-xs font-semibold border border-border-strong/60'
                    : 'text-secondary hover:text-primary hover:bg-surface/50'
                }`}
              >
                <span>{btn.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-accent/20 text-accent font-bold'
                      : 'bg-surface-subdued text-tertiary'
                  }`}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 mb-4 rounded-xl bg-danger-subtle border border-danger/20 text-danger text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Container: Date-Grouped Timeline */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3 rounded-3xl bg-surface-subdued border border-border-subtle shadow-xs">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-tertiary font-mono">
              Retrieving cryptographic ledger records from Core Banking...
            </p>
          </div>
        ) : groupedTransactions.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface-subdued border border-border-subtle shadow-xs">
            <EmptyState
              icon={<History className="w-8 h-8 text-tertiary" />}
              title="No Recorded Operations"
              description={
                filter === 'ALL'
                  ? 'There are currently no transactions recorded for this account.'
                  : `No operations matching "${filter.replace('_', ' ').toLowerCase()}" found in your recent history.`
              }
              actionLabel={filter !== 'ALL' ? 'Clear Filter' : undefined}
              onAction={filter !== 'ALL' ? () => setFilter('ALL') : undefined}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTransactions.map((group) => (
              <div key={group.key} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-2 text-xs">
                  <div className="flex items-center gap-1.5 text-secondary font-medium">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span className="font-semibold text-primary">{group.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-tertiary">
                    {group.items.length} {group.items.length === 1 ? 'operation' : 'operations'}
                  </span>
                </div>

                {/* Group Container */}
                <div className="rounded-2xl bg-surface-subdued border border-border-subtle shadow-xs divide-y divide-border-subtle/80 overflow-hidden">
                  {group.items.map((tx, idx) => (
                    <motion.div
                      key={tx.transactionId}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-surface/50 transition-colors"
                    >
                      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Transaction Item Details */}
                        <div className="flex-1 min-w-0">
                          <TransactionItem tx={tx} showBalanceAfter={true} />
                        </div>

                        {/* Denomination tags + Individual Reprint Slip Button */}
                        <div className="flex items-center gap-2 pl-12 sm:pl-0 flex-shrink-0">
                          {tx.denominations && Object.keys(tx.denominations).length > 0 && (
                            <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-tertiary">
                              {Object.entries(tx.denominations).map(([denom, count]) =>
                                count > 0 ? (
                                  <span
                                    key={denom}
                                    className="px-1.5 py-0.5 rounded bg-surface border border-border-subtle"
                                  >
                                    ₹{denom}×{count}
                                  </span>
                                ) : null
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handlePrintIndividualReceipt(tx)}
                            title="Print thermal receipt slip"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface hover:bg-surface-hover border border-border-subtle text-secondary hover:text-accent transition-all cursor-pointer shadow-2xs"
                          >
                            <Printer className="w-3 h-3 text-accent" />
                            <span>Slip</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Receipt Modal for Individual Transaction */}
        <Modal
          isOpen={!!selectedTxForReceipt}
          onClose={() => setSelectedTxForReceipt(null)}
          title="Transaction Receipt"
        >
          {selectedTxForReceipt && (
            <div className="space-y-4">
              {/* Thermal Slip Styled View */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#1a1f2c] border border-border-strong/70 text-slate-800 dark:text-slate-200 font-mono text-xs shadow-inner">
                <div className="text-center pb-3 border-b border-dashed border-border-strong/60">
                  <div className="font-bold text-sm tracking-widest text-slate-900 dark:text-white">
                    APEX TOUCH BANKING
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    TERMINAL ID: APX-MUM-04
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(selectedTxForReceipt.timestamp).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="py-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">TRANSACTION:</span>
                    <span className="font-bold">{selectedTxForReceipt.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">REFERENCE:</span>
                    <span className="font-semibold">{selectedTxForReceipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">ACCOUNT:</span>
                    <span>{maskAccountNumber(account?.accountNumber)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">CARD HOLDER:</span>
                    <span>{account?.fullName || 'CLIENT'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dashed border-border-strong/60 font-semibold text-sm">
                    <span>AMOUNT:</span>
                    <span className="font-bold">
                      ₹{selectedTxForReceipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {typeof selectedTxForReceipt.balanceAfterTransaction === 'number' && (
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>AVAIL BALANCE:</span>
                      <span>
                        ₹{selectedTxForReceipt.balanceAfterTransaction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-center pt-3 border-t border-dashed border-border-strong/60 text-[10px] text-slate-500">
                  ZERO NETWORK SURCHARGE APPLIED<br />
                  THANK YOU FOR BANKING WITH APEX
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyRef(selectedTxForReceipt.transactionId)}
                  icon={isCopied === selectedTxForReceipt.transactionId ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {isCopied === selectedTxForReceipt.transactionId ? 'Copied' : 'Copy Ref'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handlePrintIndividualReceipt(selectedTxForReceipt);
                    setSelectedTxForReceipt(null);
                  }}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Reprint to Slot
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Bottom Back Button */}
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
