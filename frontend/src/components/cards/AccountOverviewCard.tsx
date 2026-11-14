import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AccountDetails } from '../../types';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/Button';
import { NumberTicker } from '../ui/NumberTicker';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export interface AccountOverviewCardProps {
  account: AccountDetails | null;
  customerName?: string;
  className?: string;
}

export const AccountOverviewCard: React.FC<AccountOverviewCardProps> = ({
  account,
  customerName,
  className = '',
}) => {
  const navigate = useNavigate();
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    const prefix = accNum.slice(0, 3);
    const suffix = accNum.slice(-4);
    return `${prefix}••••${suffix}`;
  };

  const handleCopy = () => {
    if (!account?.accountNumber) return;
    navigator.clipboard.writeText(account.accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-surface to-surface-subdued border border-border-strong/60 shadow-sm p-4 sm:p-5 overflow-hidden ${className}`}
    >
      {/* Decorative subtle ambient glow in corner */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Row: Account Badge, User Name & Privacy Toggle */}
      <div className="flex items-start justify-between gap-3 relative z-10 pb-3 border-b border-border-subtle/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base sm:text-lg text-primary tracking-tight">
              {customerName || account?.fullName || 'Valued Client'}
            </span>
            <Badge variant="success" size="sm" dot>
              {account?.accountType?.replace(' Account', '') || 'Savings'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs font-mono text-tertiary">
            <span>{maskAccountNumber(account?.accountNumber)}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-tertiary hover:text-primary transition-colors cursor-pointer"
              title={isCopied ? 'Copied to clipboard' : 'Copy account number'}
              aria-label="Copy account number"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-[11px] text-accent">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>PCI-PTS v6</span>
            </span>
          </div>
        </div>

        {/* Actions: Settings Link & Balance Visibility Toggle */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Settings className="w-4 h-4 text-secondary" />}
            aria-label="Account and terminal settings"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="hover:text-primary"
            title="Settings"
          />
          <IconButton
            icon={
              isBalanceHidden ? (
                <EyeOff className="w-4 h-4 text-secondary" />
              ) : (
                <Eye className="w-4 h-4 text-secondary" />
              )
            }
            aria-label={isBalanceHidden ? 'Show account balance' : 'Hide account balance'}
            variant="ghost"
            size="sm"
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            className="hover:text-primary"
            title={isBalanceHidden ? 'Show Balance' : 'Hide Balance'}
          />
        </div>
      </div>

      {/* Middle Row: Balances Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 relative z-10">
        {/* Available Balance */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block mb-0.5">
            Available Balance
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-primary tracking-tight" data-tabular>
            {isBalanceHidden ? (
              <span className="text-secondary select-none tracking-widest">₹ ••••••••</span>
            ) : (
              <NumberTicker value={account?.availableBalance ?? 0} />
            )}
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
            Instant withdrawal & transfer limit
          </span>
        </div>

        {/* Total Ledger Balance */}
        <div className="sm:text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block mb-0.5">
            Total Ledger Balance
          </span>
          <div className="text-lg sm:text-xl font-semibold font-mono text-secondary tracking-tight" data-tabular>
            {isBalanceHidden ? (
              <span className="text-secondary select-none tracking-widest">₹ ••••••••</span>
            ) : (
              `₹${(account?.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            )}
          </div>
          <span className="text-[10px] font-mono text-tertiary block mt-0.5">
            Min requirement: ₹{(account?.minimumBalance ?? 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Bottom Row: Quick Action Chips */}
      <div className="pt-3 border-t border-border-subtle/60 flex flex-wrap items-center gap-2 relative z-10">
        <span className="text-[10px] font-mono uppercase text-tertiary mr-1">Fast Actions:</span>

        <button
          type="button"
          onClick={() => navigate('/withdraw')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/40 text-primary transition-all cursor-pointer shadow-2xs"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
          <span>Withdraw</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/deposit')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/40 text-primary transition-all cursor-pointer shadow-2xs"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-accent" />
          <span>Deposit</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/transfer')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/40 text-primary transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-accent" />
          <span>Transfer</span>
        </button>
      </div>
    </div>
  );
};
