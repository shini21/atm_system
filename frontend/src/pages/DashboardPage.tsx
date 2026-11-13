import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ATMTransition } from '../components/layout/ATMTransition';
import { motion } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Receipt,
  KeyRound,
  Eye,
  LogOut,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { session, account, refreshBalance } = useAuth();
  const { t } = useLanguage();
  const { inactivitySeconds, registerSideKeys } = useHardware();
  const navigate = useNavigate();

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Register physical side function keys on ATM chassis (L1-L4 and R1-R4)
  useEffect(() => {
    return registerSideKeys({
      L1: {
        id: 'L1',
        label: t('dash.withdraw') || 'Withdraw',
        onClick: () => navigate('/withdraw'),
      },
      L2: {
        id: 'L2',
        label: t('dash.transfer') || 'Transfer',
        onClick: () => navigate('/transfer'),
      },
      L3: {
        id: 'L3',
        label: t('dash.miniStatement') || 'Mini Statement',
        onClick: () => navigate('/history'),
      },
      L4: {
        id: 'L4',
        label: t('dash.pin') || 'Change PIN',
        onClick: () => navigate('/change-pin'),
      },
      R1: {
        id: 'R1',
        label: t('dash.deposit') || 'Deposit',
        onClick: () => navigate('/deposit'),
      },
      R2: {
        id: 'R2',
        label: t('dash.balance') || 'Balance Inquiry',
        onClick: () => navigate('/balance'),
      },
      R3: {
        id: 'R3',
        label: t('dash.history') || 'Transaction History',
        onClick: () => navigate('/history'),
      },
      R4: {
        id: 'R4',
        label: t('app.eject') || 'Eject Card',
        onClick: () => navigate('/eject'),
      },
    });
  }, [registerSideKeys, navigate, t]);

  // Mask account numbers everywhere: ACC1001 -> ACC••••1001
  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    const prefix = accNum.slice(0, 3);
    const suffix = accNum.slice(-4);
    return `${prefix}••••${suffix}`;
  };

  // 8-Operation ATM Menu Items (4 Left Rows, 4 Right Rows)
  const leftOperations = [
    {
      keyId: 'L1',
      title: t('dash.withdraw') || 'Cash Withdrawal',
      subtitle: 'Fast or Custom Dispense',
      icon: <ArrowUpRight className="w-4 h-4 text-accent" />,
      onClick: () => navigate('/withdraw'),
    },
    {
      keyId: 'L2',
      title: t('dash.transfer') || 'Funds Transfer',
      subtitle: 'Instant Account Transfer',
      icon: <ArrowLeftRight className="w-4 h-4 text-accent" />,
      onClick: () => navigate('/transfer'),
    },
    {
      keyId: 'L3',
      title: t('dash.miniStatement') || 'Mini Statement',
      subtitle: 'Last 5 Transactions',
      icon: <Receipt className="w-4 h-4 text-accent" />,
      onClick: () => navigate('/history'),
    },
    {
      keyId: 'L4',
      title: t('dash.pin') || 'Change PIN',
      subtitle: 'Card Security Update',
      icon: <KeyRound className="w-4 h-4 text-accent" />,
      onClick: () => navigate('/change-pin'),
    },
  ];

  const rightOperations = [
    {
      keyId: 'R1',
      title: t('dash.deposit') || 'Cash Deposit',
      subtitle: 'Direct Account Credit',
      icon: <ArrowDownLeft className="w-4 h-4 text-accent" />,
      onClick: () => navigate('/deposit'),
    },
    {
      keyId: 'R2',
      title: t('dash.balance') || 'Balance Inquiry',
      subtitle: 'Real-Time Ledger Check',
      icon: <Eye className="w-4 h-4 text-accent" />,
      onClick: () => navigate('/balance'),
    },
    {
      keyId: 'R3',
      title: t('dash.history') || 'Transaction History',
      subtitle: 'Statement & Receipts',
      icon: <FileText className="w-4 h-4 text-accent" />,
      onClick: () => navigate('/history'),
    },
    {
      keyId: 'R4',
      title: t('app.eject') || 'Eject Card & Exit',
      subtitle: 'End Terminal Session',
      icon: <LogOut className="w-4 h-4 text-danger" />,
      isDanger: true,
      onClick: () => navigate('/eject'),
    },
  ];

  // Circular timer circumference (r = 14)
  const timerRadius = 14;
  const circumference = 2 * Math.PI * timerRadius;
  const timerOffset = ((60 - inactivitySeconds) / 60) * circumference;

  return (
    <ATMTransition>
      <div className="flex flex-col justify-between h-full min-h-[420px] py-1 select-none">
        
        {/* Top Header: Account Identity + Balance + Live Session Timer */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border-subtle"
        >
          {/* Customer & Masked Account Line */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg text-primary tracking-tight">
                {session?.customerName || account?.fullName || 'Valued Client'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-subdued text-secondary border border-border-subtle">
                {account?.accountType?.replace(' Account', '') || 'Savings'}
              </span>
            </div>
            <div className="text-xs text-tertiary font-mono mt-0.5 flex items-center gap-2">
              <span>{maskAccountNumber(account?.accountNumber)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px] text-accent">
                <ShieldCheck className="w-3 h-3" /> Encrypted Session
              </span>
            </div>
          </div>

          {/* Right Header Box: Available Balance & Circular Session Countdown */}
          <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto">
            {/* Prominent Balance Display */}
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block">
                Available Balance
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-primary tracking-tight" data-tabular>
                <NumberTicker value={account?.availableBalance ?? 0} />
              </div>
            </div>

            {/* Circular Session Countdown Indicator */}
            <div
              className="flex items-center gap-2 pl-3 border-l border-border-subtle"
              title={`Session timeout in ${inactivitySeconds}s`}
            >
              <div className="relative w-9 h-9 flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle
                    cx="18"
                    cy="18"
                    r={timerRadius}
                    className="stroke-border-subtle fill-none"
                    strokeWidth="3"
                  />
                  {/* Animated Progress Ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r={timerRadius}
                    className={`fill-none transition-all duration-300 ${
                      inactivitySeconds <= 15
                        ? 'stroke-warning'
                        : inactivitySeconds <= 30
                        ? 'stroke-accent-brass'
                        : 'stroke-accent'
                    }`}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={timerOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className={`absolute font-mono text-[10px] font-bold ${
                    inactivitySeconds <= 15 ? 'text-warning animate-pulse' : 'text-secondary'
                  }`}
                >
                  {inactivitySeconds}
                </span>
              </div>
              <div className="hidden lg:block text-[10px] font-mono leading-tight text-tertiary">
                <span className="block uppercase text-secondary">Timeout</span>
                <span>{inactivitySeconds}s</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 8-Operation ATM Menu Grid Aligned to Physical Side Keys (L1-L4 and R1-R4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-auto">
          
          {/* Left Operations Column (Aligned to L1-L4) */}
          <div className="space-y-2.5">
            {leftOperations.map((op) => (
              <motion.button
                key={op.keyId}
                type="button"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98, x: -4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                onClick={op.onClick}
                className="group w-full h-14 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-surface-subdued to-surface hover:from-surface-hover hover:to-surface-subdued border border-border-subtle hover:border-accent/50 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer"
              >
                {/* Left Indicator & Key Tag */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-surface border border-border-subtle font-mono text-[10px] font-bold text-secondary group-hover:text-accent group-hover:border-accent/40 shadow-2xs">
                    {op.keyId}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-primary group-hover:text-accent transition-colors flex items-center gap-1.5">
                      <span>{op.title}</span>
                    </div>
                    <div className="text-[10px] text-tertiary font-mono">
                      {op.subtitle}
                    </div>
                  </div>
                </div>

                {/* Right Icon / Pointer */}
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-surface text-secondary group-hover:text-accent border border-border-subtle/50 transition-colors">
                    {op.icon}
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right Operations Column (Aligned to R1-R4) */}
          <div className="space-y-2.5">
            {rightOperations.map((op) => (
              <motion.button
                key={op.keyId}
                type="button"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98, x: 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                onClick={op.onClick}
                className={`group w-full h-14 px-3 sm:px-4 rounded-xl bg-gradient-to-l from-surface-subdued to-surface hover:from-surface-hover hover:to-surface-subdued border shadow-xs flex items-center justify-between text-right transition-all cursor-pointer ${
                  op.isDanger
                    ? 'border-border-subtle hover:border-danger/40 hover:bg-danger-subtle/10'
                    : 'border-border-subtle hover:border-accent/50'
                }`}
              >
                {/* Left Icon / Pointer */}
                <div className="flex items-center gap-1.5">
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    op.isDanger ? 'text-danger' : 'text-accent'
                  }`} />
                  <div className={`p-1 rounded-md bg-surface border border-border-subtle/50 transition-colors ${
                    op.isDanger ? 'text-danger' : 'text-secondary group-hover:text-accent'
                  }`}>
                    {op.icon}
                  </div>
                </div>

                {/* Right Content & Key Tag */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className={`text-xs sm:text-sm font-semibold transition-colors flex items-center justify-end gap-1.5 ${
                      op.isDanger ? 'text-danger' : 'text-primary group-hover:text-accent'
                    }`}>
                      <span>{op.title}</span>
                    </div>
                    <div className="text-[10px] text-tertiary font-mono">
                      {op.subtitle}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-surface border border-border-subtle font-mono text-[10px] font-bold text-secondary group-hover:text-accent group-hover:border-accent/40 shadow-2xs">
                    {op.keyId}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bottom Status Ticker Bar */}
        <div className="pt-3 mt-3 border-t border-border-subtle flex flex-wrap items-center justify-between text-[11px] text-tertiary font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terminal Ready • 24/7 Apex Network</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Card: {session?.maskedCardNumber || '•••• ••••'}</span>
            <span>•</span>
            <span>Use screen touch or physical side buttons [L1-L4 / R1-R4]</span>
          </div>
        </div>

      </div>
    </ATMTransition>
  );
};
