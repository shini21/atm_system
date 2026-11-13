import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware } from '../context/HardwareContext';
import { api, getErrorMessage } from '../services/api';
import type { TransactionItem as TransactionItemType } from '../types';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { ATMTransition } from '../components/layout/ATMTransition';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { History, RefreshCw, AlertCircle, ArrowLeft, Printer } from 'lucide-react';

type FilterType = 'ALL' | 'DEPOSITS' | 'WITHDRAWALS' | 'TRANSFERS';

export const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItemType[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      // Backend supports count parameter; get the latest 10 transactions
      const data = await api.getRecentTransactions(10);
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
        label: 'Print Slip',
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
        label: 'Filter All',
        onClick: () => setFilter('ALL'),
      },
    });
  }, [registerSideKeys, transactions, account, printReceipt, navigate]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    if (filter === 'DEPOSITS') return tx.type === 'DEPOSIT';
    if (filter === 'WITHDRAWALS') return tx.type === 'WITHDRAWAL';
    if (filter === 'TRANSFERS') return tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT';
    return true;
  });

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All Operations', value: 'ALL' },
    { label: 'Deposits', value: 'DEPOSITS' },
    { label: 'Withdrawals', value: 'WITHDRAWALS' },
    { label: 'Transfers', value: 'TRANSFERS' },
  ];

  return (
    <ATMTransition>
      <div className="max-w-2xl mx-auto py-2">
        {/* Top Navigation Bar */}
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
              Activity Ledger
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
              Transaction History
            </h1>
            <p className="text-xs text-secondary mt-1 font-mono">
              Account: {maskAccountNumber(account?.accountNumber)} ({account?.accountType})
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
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Print
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-subdued border border-border-subtle mb-5 overflow-x-auto">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setFilter(btn.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap select-none ${
                filter === btn.value
                  ? 'bg-surface text-primary shadow-2xs font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {btn.label}
            </button>
          ))}
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

        {/* Content Container */}
        <div className="p-4 sm:p-5 rounded-3xl bg-surface-subdued border border-border-subtle shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-tertiary font-mono">
                Retrieving ledger records from Banking Core...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center mx-auto text-tertiary mb-3">
                <History className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-primary">No transactions found</p>
              <p className="text-xs text-tertiary max-w-xs mx-auto">
                {filter === 'ALL'
                  ? 'There are currently no recorded operations for this account.'
                  : `No ${filter.toLowerCase()} operations recorded for this account.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {filteredTransactions.map((tx, idx) => (
                <motion.div
                  key={tx.transactionId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <TransactionItem tx={tx} showBalanceAfter={true} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

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
