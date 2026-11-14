import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHardware } from '../context/HardwareContext';
import { ATMTransition } from '../components/layout/ATMTransition';
import { AccountOverviewCard } from '../components/cards/AccountOverviewCard';
import { RecentActivityTimeline } from '../components/transactions/RecentActivityTimeline';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { session, account, refreshBalance } = useAuth();
  const { t } = useLanguage();
  const { registerSideKeys, registerKeypadListener } = useHardware();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    refreshBalance().then(() => setRefreshKey((k) => k + 1));
  }, [refreshBalance]);

  // Physical Keypad numeric shortcuts from laptop keypad
  useEffect(() => {
    const unsubscribe = registerKeypadListener((key) => {
      if (key === '1') navigate('/withdraw');
      else if (key === '2') navigate('/deposit');
      else if (key === '3') navigate('/balance');
      else if (key === '4') navigate('/transfer');
      else if (key === '5') navigate('/history');
      else if (key === '6') navigate('/change-pin');
      else if (key === 'CANCEL') navigate('/eject');
    });
    return unsubscribe;
  }, [registerKeypadListener, navigate]);

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

  return (
    <ATMTransition>
      <div className="flex flex-col space-y-4 py-1 select-none">
        
        {/* Top Hero: Account Overview Card with Privacy Toggle & Balance */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AccountOverviewCard
            account={account}
            customerName={session?.customerName}
          />
        </motion.div>

        {/* 8-Operation ATM Menu Grid Aligned to Physical Side Keys (L1-L4 and R1-R4) */}
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle text-xs font-mono text-tertiary">
            <span className="uppercase tracking-wider font-semibold text-secondary">
              ATM Terminal Operations
            </span>
            <span className="hidden sm:inline text-[10px]">
              Mapped to Side Keys [L1-L4 & R1-R4]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Left Operations Column (Aligned to L1-L4) */}
            <div className="space-y-2">
              {leftOperations.map((op) => (
                <motion.button
                  key={op.keyId}
                  type="button"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.98, x: -4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={op.onClick}
                  className="group w-full h-13 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-surface-subdued to-surface hover:from-surface-hover hover:to-surface-subdued border border-border-subtle hover:border-accent/50 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer"
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
            <div className="space-y-2">
              {rightOperations.map((op) => (
                <motion.button
                  key={op.keyId}
                  type="button"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98, x: 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={op.onClick}
                  className={`group w-full h-13 px-3 sm:px-4 rounded-xl bg-gradient-to-l from-surface-subdued to-surface hover:from-surface-hover hover:to-surface-subdued border shadow-xs flex items-center justify-between text-right transition-all cursor-pointer ${
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
        </div>

        {/* Real Backend-Grounded Recent Activity Timeline */}
        <RecentActivityTimeline refreshKey={refreshKey} />

        {/* Bottom Status Ticker Bar */}
        <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between text-[11px] text-tertiary font-mono">
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
