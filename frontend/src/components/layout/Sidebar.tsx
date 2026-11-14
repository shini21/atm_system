import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { motion } from 'motion/react';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, account, clearCard } = useAuth();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Main Dashboard',
      shortLabel: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />,
      badge: null,
    },
    {
      path: '/withdraw',
      label: 'Withdraw Cash',
      shortLabel: 'Withdraw',
      icon: <ArrowUpRight className="w-4 h-4 flex-shrink-0" />,
      badge: 'ATM',
    },
    {
      path: '/deposit',
      label: 'Deposit Cash',
      shortLabel: 'Deposit',
      icon: <ArrowDownLeft className="w-4 h-4 flex-shrink-0" />,
      badge: null,
    },
    {
      path: '/transfer',
      label: 'Transfer Funds',
      shortLabel: 'Transfer',
      icon: <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />,
      badge: null,
    },
    {
      path: '/balance',
      label: 'Balance Inquiry',
      shortLabel: 'Balance',
      icon: <Wallet className="w-4 h-4 flex-shrink-0" />,
      badge: null,
    },
    {
      path: '/history',
      label: 'Audit Statement',
      shortLabel: 'History',
      icon: <FileText className="w-4 h-4 flex-shrink-0" />,
      badge: null,
    },
    {
      path: '/change-pin',
      label: 'PIN Management',
      shortLabel: 'PIN',
      icon: <KeyRound className="w-4 h-4 flex-shrink-0" />,
      badge: null,
    },
  ];

  const handleEject = () => {
    if (session?.authenticated) {
      navigate('/eject');
    } else {
      clearCard();
      navigate('/');
    }
  };

  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    return `${accNum.slice(0, 3)}••••${accNum.slice(-4)}`;
  };

  return (
    <aside
      aria-label="Banking Operations Navigation"
      className={`hidden md:flex flex-col justify-between rounded-2xl bg-surface/90 backdrop-blur-md border border-border-subtle shadow-sm transition-all duration-300 select-none py-3 px-2 ${
        isCollapsed ? 'w-16' : 'w-56'
      } ${className}`}
    >
      <div>
        {/* Sidebar Header with Collapse Button */}
        <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-primary text-surface flex items-center justify-center font-bold text-xs flex-shrink-0">
              AP
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="min-w-0"
              >
                <div className="font-bold text-xs text-primary truncate leading-tight">APEX Terminal</div>
                <div className="text-[10px] text-tertiary font-mono truncate leading-tight">X-9000 Online</div>
              </motion.div>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-surface-subdued transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Item Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-accent font-semibold bg-accent/10'
                    : 'text-secondary hover:text-primary hover:bg-surface-subdued'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                {/* Active Indicator Accent Bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                <span className={isActive ? 'text-accent' : 'text-secondary'}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface border border-border-subtle text-accent font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Profile & Eject Footer */}
      {session?.authenticated && (
        <div className="pt-2 border-t border-border-subtle">
          {!isCollapsed ? (
            <div className="p-2 rounded-xl bg-surface-subdued border border-border-subtle space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-primary truncate max-w-[100px]">
                  {session.customerName || account?.fullName || 'Client'}
                </span>
                <span className="text-[9px] font-mono px-1 rounded bg-surface text-accent font-semibold">
                  {account?.accountType?.replace(' Account', '') || 'Savings'}
                </span>
              </div>
              <div className="text-[10px] font-mono text-tertiary">
                {maskAccountNumber(session.cardNumber)}
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px] font-mono border-t border-border-subtle/60">
                <span className="text-[9px] text-tertiary uppercase">Available</span>
                <span className="font-semibold text-accent text-xs">
                  ₹{(account?.availableBalance ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <button
                type="button"
                onClick={handleEject}
                className="w-full mt-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-medium text-danger hover:bg-danger-subtle/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Eject Card</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div
                title={`${session.customerName || 'Client'} (${maskAccountNumber(session.cardNumber)})`}
                className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-xs font-bold"
              >
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <button
                type="button"
                onClick={handleEject}
                title="Eject card and exit"
                className="p-1.5 rounded-lg text-danger hover:bg-danger-subtle/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
