import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import type { TransactionItem } from '../../types';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  History,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';

export interface RecentActivityTimelineProps {
  className?: string;
  refreshKey?: number;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  className = '',
  refreshKey = 0,
}) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getRecentTransactions(5);
        if (isMounted) {
          setTransactions(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const getTransactionDetails = (tx: TransactionItem) => {
    const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN';

    let icon = <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
    let label = 'Cash Deposit';

    if (tx.type === 'WITHDRAWAL') {
      icon = <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      label = 'Cash Withdrawal';
    } else if (tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER' as any) {
      icon = <ArrowLeftRight className="w-4 h-4 text-cyan" />;
      label = 'Funds Transfer';
    } else if (tx.type === 'TRANSFER_IN') {
      icon = <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      label = 'Transfer Received';
    }

    const formattedTime = tx.timestamp
      ? new Date(tx.timestamp).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recent';

    return { isCredit, icon, label, formattedTime };
  };

  return (
    <div
      className={`rounded-2xl bg-surface border border-border-subtle shadow-sm p-4 sm:p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-primary">Recent Terminal Activity</h3>
        </div>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Statement</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 py-1">
          <Skeleton variant="rounded" height={44} />
          <Skeleton variant="rounded" height={44} />
          <Skeleton variant="rounded" height={44} />
        </div>
      ) : error ? (
        <div className="p-3 text-xs text-danger rounded-xl bg-danger-subtle border border-danger/20 font-mono">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-5 h-5" />}
          title="No Transactions Yet"
          description="Your session has no recorded activity. Make a deposit or withdrawal to see entries."
          actionLabel="Deposit Cash"
          onAction={() => navigate('/deposit')}
        />
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const { isCredit, icon, label, formattedTime } = getTransactionDetails(tx);

            return (
              <motion.div
                key={tx.transactionId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-xl bg-surface-subdued hover:bg-surface-hover border border-border-subtle transition-colors flex items-center justify-between gap-3 text-xs"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-surface border border-border-subtle flex-shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-primary truncate">{label}</div>
                    <div className="text-[10px] font-mono text-tertiary truncate">
                      {tx.transactionId} • {formattedTime}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Balance */}
                <div className="text-right flex-shrink-0 font-mono">
                  <div
                    className={`font-semibold ${
                      isCredit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-primary'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹
                    {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-tertiary">
                    Bal: ₹{tx.balanceAfterTransaction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

