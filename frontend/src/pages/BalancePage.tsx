import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { NumberTicker } from '../components/ui/NumberTicker';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ATMTransition } from '../components/layout/ATMTransition';
import { motion } from 'motion/react';
import {
  Printer,
  ArrowUpRight,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export const BalancePage: React.FC = () => {
  const { account, balanceInfo, refreshBalance } = useAuth();
  const { t } = useLanguage();
  const { printReceipt } = useHardware();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  useEffect(() => {
    refreshBalance();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const totalBalance = balanceInfo?.currentBalance ?? account?.balance ?? 0;
  const availableBalance = balanceInfo?.availableBalance ?? account?.availableBalance ?? 0;
  const minimumBalance = balanceInfo?.minimumBalance ?? account?.minimumBalance ?? 0;

  return (
    <ATMTransition>
      <div className="max-w-xl mx-auto py-2">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
          Balance Summary
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
          Account Balance
        </h1>
        <p className="text-xs text-secondary mt-1 font-mono">
          {account?.accountNumber} • {account?.accountType}
        </p>
      </motion.div>

      {/* Main Minimalist Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="p-6 sm:p-8 rounded-3xl bg-surface-subdued border border-border-subtle shadow-sm mb-6"
      >
        {/* Available Balance Focus */}
        <div className="text-center pb-6 border-b border-border-subtle">
          <span className="text-xs font-medium uppercase tracking-wider text-tertiary">
            Available To Withdraw
          </span>
          <div className="text-4xl sm:text-5xl font-semibold text-primary tracking-tight mt-1">
            <NumberTicker value={availableBalance} />
          </div>
          <p className="text-[11px] text-tertiary mt-2">
            Real-time balance verified by Apex Core Engine
          </p>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 gap-4 pt-6 text-xs">
          <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
            <span className="text-tertiary block font-medium">Total Ledger</span>
            <span className="text-base font-semibold font-mono text-primary mt-0.5 block">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
            <span className="text-tertiary block font-medium">Minimum Balance</span>
            <span className="text-base font-semibold font-mono text-secondary mt-0.5 block">
              ₹{minimumBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Account Details Row */}
        <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-tertiary">
          <span>Holder: <strong className="text-primary font-medium">{account?.fullName}</strong></span>
          <span>Card: <strong className="text-primary font-medium font-mono">{account?.maskedCardNumber}</strong></span>
        </div>
      </motion.div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handleRefresh}
          isLoading={isRefreshing}
          icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => {
            setIsReceiptOpen(true);
            printReceipt({
              transactionId: `STMT-${Date.now().toString().slice(-6)}`,
              type: 'BALANCE INQUIRY',
              amount: 0,
              balanceAfter: availableBalance,
              timestamp: new Date().toISOString(),
              accountNumber: account?.accountNumber || 'ACC1001',
              cardHolderName: account?.fullName,
            });
          }}
          icon={<Printer className="w-4 h-4" />}
        >
          {t('balance.print')}
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/withdraw')}
          icon={<ArrowUpRight className="w-4 h-4" />}
        >
          Withdraw Cash
        </Button>
      </div>

      {/* Return to Dashboard */}
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

      {/* Minimalist Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Account Statement Receipt"
      >
        <div className="p-2 space-y-4 font-mono text-xs">
          <div className="text-center pb-3 border-b border-border-subtle">
            <div className="font-bold text-sm text-primary">APEX BANKING CORP</div>
            <div className="text-tertiary text-[11px]">Terminal Session Receipt</div>
            <div className="text-tertiary text-[10px] mt-0.5">
              {new Date().toLocaleString('en-IN')}
            </div>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex justify-between">
              <span className="text-tertiary">Account No:</span>
              <span className="text-primary font-medium">{account?.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Account Type:</span>
              <span className="text-primary">{account?.accountType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Card Number:</span>
              <span className="text-primary">{account?.maskedCardNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Cardholder:</span>
              <span className="text-primary font-medium">{account?.fullName}</span>
            </div>
          </div>

          <div className="py-2.5 border-t border-b border-border-subtle space-y-1">
            <div className="flex justify-between">
              <span className="text-tertiary">Ledger Balance:</span>
              <span className="text-primary font-medium">
                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Minimum Balance:</span>
              <span className="text-secondary">
                ₹{minimumBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border-subtle">
              <span className="text-primary">Available Balance:</span>
              <span className="text-accent">
                ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-tertiary">
            Thank you for banking with Apex. Please take your card.
          </div>
        </div>
      </Modal>
    </div>
    </ATMTransition>
  );
};
