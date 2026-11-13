import React from 'react';
import { motion } from 'motion/react';
import { Wifi, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CardGraphicProps {
  cardNumber: string;
  cardHolderName?: string;
  expiryDate?: string;
  accountType?: string;
  isBlocked?: boolean;
  isExpired?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CardGraphic: React.FC<CardGraphicProps> = ({
  cardNumber,
  cardHolderName = 'CARDHOLDER',
  expiryDate = '12/28',
  accountType = 'Savings Account',
  isBlocked = false,
  isExpired = false,
  interactive = false,
  onClick,
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Format card number with clean masking: e.g., •••• •••• 1001
  const formatCardNumber = (num: string) => {
    if (!num) return '•••• •••• •••• 0000';
    if (num.startsWith('CARD')) {
      const suffix = num.replace('CARD', '');
      return `•••• •••• •••• ${suffix}`;
    }
    if (num.length >= 4) {
      return `•••• •••• •••• ${num.slice(-4)}`;
    }
    return num;
  };

  const getStatusBadge = () => {
    if (isBlocked) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-danger-subtle text-danger border border-danger/20">
          <ShieldAlert className="w-3 h-3" /> Blocked
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning-subtle text-warning border border-warning/20">
          <Clock className="w-3 h-3" /> Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-subtle text-success border border-success/20">
        <ShieldCheck className="w-3 h-3" /> Active
      </span>
    );
  };

  return (
    <motion.div
      whileHover={interactive ? { y: -3, scale: 1.01 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`relative w-72 h-44 sm:w-80 sm:h-48 rounded-2xl p-5 select-none transition-all duration-300 flex flex-col justify-between border ${
        interactive ? 'cursor-pointer' : ''
      } ${
        isDark
          ? 'bg-gradient-to-br from-[#1B1D22] via-[#14161A] to-[#0E1013] text-white border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.5)]'
          : 'bg-gradient-to-br from-[#FFFFFF] via-[#F8F9FA] to-[#EDEDF2] text-gray-900 border-gray-200 shadow-[0_12px_28px_rgba(0,0,0,0.06)]'
      } ${className}`}
    >
      {/* Top Bar: Brand & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] tracking-tight shadow-sm ${
            isDark ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            AP
          </div>
          <div>
            <span className="font-semibold text-xs tracking-tight">APEX</span>
            <span className={`ml-1 text-[10px] uppercase tracking-wider ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {accountType.replace(' Account', '')}
            </span>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Chip & Contactless */}
      <div className="flex items-center gap-3 my-auto">
        {/* Minimal EMV Chip */}
        <div className={`w-9 h-7 rounded-md border p-1 flex flex-col justify-between ${
          isDark 
            ? 'bg-gradient-to-tr from-[#3A3D45] to-[#252830] border-white/15' 
            : 'bg-gradient-to-tr from-[#E2E4E9] to-[#D1D5DB] border-gray-300'
        }`}>
          <div className={`w-full h-[1px] rounded ${isDark ? 'bg-white/20' : 'bg-gray-400/40'}`} />
          <div className={`w-full h-[1px] rounded ${isDark ? 'bg-white/20' : 'bg-gray-400/40'}`} />
          <div className={`w-full h-[1px] rounded ${isDark ? 'bg-white/20' : 'bg-gray-400/40'}`} />
        </div>
        <Wifi className={`w-4 h-4 rotate-90 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
      </div>

      {/* Bottom Bar: Number & Name */}
      <div>
        <div className="font-mono text-xs sm:text-sm tracking-wider font-medium mb-1">
          {formatCardNumber(cardNumber)}
        </div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-medium">
          <span className={`truncate max-w-[180px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {cardHolderName}
          </span>
          <span className={`font-mono text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            EXP {expiryDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
