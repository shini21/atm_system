import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NumberTicker } from '../components/ui/NumberTicker';
import { SpotlightCard } from '../components/cards/SpotlightCard';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { ATMTransition } from '../components/layout/ATMTransition';
import { api } from '../services/api';
import type { TransactionItem as TransactionItemType } from '../types';
import { motion } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Receipt,
  KeyRound,
  Eye,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { session, account, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<TransactionItemType[]>([]);

  useEffect(() => {
    refreshBalance();
    const fetchRecent = async () => {
      try {
        const items = await api.getRecentTransactions(3);
        if (Array.isArray(items)) {
          setRecentTransactions(items);
        }
      } catch {
        // Fallback gracefully
      }
    };
    fetchRecent();
  }, []);

  const actionItems = [
    {
      title: 'Withdraw',
      desc: 'Fast cash or custom amount',
      icon: <ArrowUpRight className="w-5 h-5" />,
      path: '/withdraw',
      spotlightColor: '#FF5C5C', // Coral/Amber accent
    },
    {
      title: 'Deposit',
      desc: 'Instant currency deposit',
      icon: <ArrowDownLeft className="w-5 h-5" />,
      path: '/deposit',
      spotlightColor: '#10B981', // Emerald/Mint accent
    },
    {
      title: 'Transfer',
      desc: 'Account-to-account funds',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      path: '/transfer',
      spotlightColor: '#0EA5E9', // Cobalt/Cyan accent
    },
    {
      title: 'Balance Details',
      desc: 'Account limits & statements',
      icon: <Eye className="w-5 h-5" />,
      path: '/balance',
      spotlightColor: '#818CF8', // Ice Blue / Platinum accent
    },
    {
      title: 'Activity Ledger',
      desc: 'Full transaction statement',
      icon: <Receipt className="w-5 h-5" />,
      path: '/history',
      spotlightColor: '#64748B', // Muted Blue / Silver accent
    },
    {
      title: 'Security & PIN',
      desc: 'Change your card PIN',
      icon: <KeyRound className="w-5 h-5" />,
      path: '/change-pin',
      spotlightColor: '#8B5CF6', // Violet/Indigo accent
    },
  ];

  return (
    <ATMTransition>
      <div className="space-y-8 py-2">
        {/* Top Section: Balance & Account Identity (Typography & Spacing Driven) */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border-subtle"
        >
          <div>
            <div className="text-xs font-medium text-secondary">
              {session?.customerName || account?.fullName || 'Valued Client'}
            </div>
            <div className="text-xs text-tertiary mt-0.5 font-mono">
              {account?.accountNumber} • {account?.accountType?.replace(' Account', '')}
            </div>
            <div className="mt-4">
              <span className="text-xs text-tertiary block font-medium uppercase tracking-wider">
                Available Balance
              </span>
              <div className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight mt-0.5">
                <NumberTicker value={account?.availableBalance ?? 0} />
              </div>
            </div>
          </div>

          {/* Minimal Secondary Details Pill */}
          <div className="flex items-center gap-4 text-xs font-mono text-tertiary">
            <div>
              <span className="block text-[10px] uppercase text-secondary">Card</span>
              <span className="text-primary font-medium">{session?.maskedCardNumber || '•••• •••• ••••'}</span>
            </div>
            <div className="w-[1px] h-6 bg-border-subtle" />
            <div>
              <span className="block text-[10px] uppercase text-secondary">Min Required</span>
              <span className="text-primary font-medium">₹{(account?.minimumBalance ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Actions Grid: 6 SpotlightCard Tiles */}
        <div>
          <div className="text-xs font-medium text-secondary uppercase tracking-wider mb-3">
            ATM Operations
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actionItems.map((item) => (
              <SpotlightCard
                key={item.title}
                title={item.title}
                desc={item.desc}
                icon={item.icon}
                spotlightColor={item.spotlightColor}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity List: Clean Stripe / Linear Row Style */}
        {recentTransactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="pt-2"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-medium text-secondary uppercase tracking-wider">
                Recent Activity
              </span>
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="text-xs font-medium text-accent hover:underline cursor-pointer"
              >
                View Statement →
              </button>
            </div>

            <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
              {recentTransactions.map((tx) => (
                <TransactionItem key={tx.transactionId} tx={tx} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ATMTransition>
  );
};
