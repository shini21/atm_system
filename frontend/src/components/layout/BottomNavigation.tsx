import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Menu,
} from 'lucide-react';
import { motion } from 'motion/react';

export interface BottomNavigationProps {
  onOpenMenu: () => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onOpenMenu,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  // Bottom navigation is active only during an authenticated session
  if (!session?.authenticated) {
    return null;
  }

  const items = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />,
    },
    {
      path: '/withdraw',
      label: 'Withdraw',
      icon: <ArrowUpRight className="w-4 h-4 flex-shrink-0" />,
    },
    {
      path: '/deposit',
      label: 'Deposit',
      icon: <ArrowDownLeft className="w-4 h-4 flex-shrink-0" />,
    },
    {
      path: '/transfer',
      label: 'Transfer',
      icon: <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation Capsule"
      className={`md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] px-2 py-1 rounded-full bg-surface/90 backdrop-blur-xl border border-border-strong/60 shadow-luxury flex items-center gap-1 select-none ${className}`}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`relative min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
              isActive
                ? 'text-accent font-semibold bg-accent/15'
                : 'text-secondary hover:text-primary active:bg-surface-subdued'
            }`}
            aria-label={item.label}
          >
            {item.icon}
            {isActive && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[11px] whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        );
      })}

      {/* More / Menu Drawer Trigger */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open More Terminal Operations"
        className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-primary active:bg-surface-subdued flex items-center justify-center gap-1 cursor-pointer transition-colors"
      >
        <Menu className="w-4 h-4" />
        <span className="text-[11px] sr-only">Menu</span>
      </button>
    </nav>
  );
};

