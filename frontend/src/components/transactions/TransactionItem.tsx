import React from 'react';
import type { TransactionItem as TransactionItemType } from '../../types';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, KeyRound } from 'lucide-react';

interface TransactionItemProps {
  tx: TransactionItemType;
  showBalanceAfter?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  showBalanceAfter = true,
}) => {
  const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN';
  const isTransfer = tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT';
  const isPinChange = tx.type === 'PIN_CHANGE';

  // Format currency in Indian Rupees
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  // Format timestamp
  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return ts || 'Recent';
    }
  };

  const getIcon = () => {
    if (isPinChange) {
      return <KeyRound className="w-4 h-4 text-secondary" />;
    }
    if (isTransfer) {
      return <ArrowLeftRight className={`w-4 h-4 ${isCredit ? 'text-emerald-500' : 'text-primary'}`} />;
    }
    if (isCredit) {
      return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-[#FF5C5C]" />;
  };

  return (
    <div className="py-3.5 px-3 flex items-center justify-between text-xs hover:bg-surface-subdued/50 transition-colors rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs flex-shrink-0 ${
            isCredit
              ? 'bg-success-subtle border-success/20'
              : 'bg-surface-subdued border-border-subtle'
          }`}
        >
          {getIcon()}
        </div>

        <div className="min-w-0">
          <div className="font-medium text-sm text-primary truncate">
            {tx.description}
          </div>
          <div className="text-[11px] text-tertiary flex items-center gap-1.5 mt-0.5">
            <span>{formatTime(tx.timestamp)}</span>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <span className="font-mono">Ref: {tx.transactionId}</span>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0 ml-4">
        {!isPinChange && (
          <div
            className={`font-mono font-semibold text-sm tracking-tight ${
              isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
            }`}
          >
            {isCredit ? '+' : '-'}{formatINR(tx.amount)}
          </div>
        )}
        {showBalanceAfter && typeof tx.balanceAfterTransaction === 'number' && (
          <div className="text-[10px] text-tertiary font-mono mt-0.5">
            Bal: {formatINR(tx.balanceAfterTransaction)}
          </div>
        )}
      </div>
    </div>
  );
};

