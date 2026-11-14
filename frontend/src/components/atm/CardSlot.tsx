import React from 'react';
import { motion } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, ShieldCheck } from 'lucide-react';

export const CardSlot: React.FC = () => {
  const { cardSlotState } = useHardware();
  const { session, cardStatus } = useAuth();

  const getLedColor = () => {
    switch (cardSlotState) {
      case 'inserted':
        return 'bg-champagne dark:bg-cyan-400 shadow-[0_0_10px_rgba(185,148,91,0.8)] dark:shadow-[0_0_10px_rgba(6,182,212,0.8)]';
      case 'reading':
        return 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.9)]';
      case 'blocked':
        return 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)]';
      case 'ejected':
        return 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.9)]';
      case 'empty':
      default:
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    }
  };

  const getStatusText = () => {
    switch (cardSlotState) {
      case 'inserted':
        return 'CARD SECURED';
      case 'reading':
        return 'READING CHIP...';
      case 'blocked':
        return 'CARD BLOCKED';
      case 'ejected':
        return 'PLEASE TAKE CARD';
      case 'empty':
      default:
        return 'SLOT READY';
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Label and Status LED */}
      <div className="flex items-center justify-between w-full max-w-[240px] mb-1.5 px-1">
        <span className="text-[10px] font-mono tracking-wider text-tertiary uppercase flex items-center gap-1.5 font-medium">
          <CreditCard className="w-3.5 h-3.5 text-secondary" />
          <span>Card Reader</span>
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${getLedColor()} transition-colors duration-300`} />
          <span className="text-[9px] font-mono tracking-tight text-tertiary uppercase font-semibold">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Physical Slot Bezel with Brushed Texture */}
      <div className="relative w-full max-w-[240px] h-12 rounded-xl bg-surface-subdued border border-border-strong shadow-inner flex items-center justify-center p-1.5 overflow-hidden group">
        {/* Slot Aperture Rim */}
        <div className="w-full h-2.5 rounded-full bg-black/75 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] relative flex items-center justify-center border border-black/50">
          {/* Status Line Light inside slot */}
          <div
            className={`w-20 h-[2px] rounded-full transition-all duration-300 ${
              cardSlotState === 'inserted'
                ? 'bg-champagne/80 dark:bg-cyan-400/80 shadow-[0_0_6px_rgba(185,148,91,0.8)]'
                : cardSlotState === 'blocked'
                ? 'bg-rose-500/80'
                : 'bg-emerald-400/80 animate-pulse'
            }`}
          />
        </div>

        {/* Inserted Card Graphic Peek */}
        {(cardSlotState === 'inserted' || session?.authenticated) && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute bottom-1 w-32 h-7 rounded-t-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 border-t border-x border-champagne/50 dark:border-accent/50 shadow-md flex items-center justify-between px-2.5 text-[9px] text-amber-200 dark:text-cyan-200 font-mono select-none"
          >
            {/* Realistic Golden Smart Chip */}
            <div className="w-3.5 h-2.5 rounded-xs bg-gradient-to-br from-amber-300 to-yellow-600 border border-amber-200/80 shadow-xs flex items-center justify-center">
              <div className="w-2 h-1 border-t border-b border-amber-900/40" />
            </div>
            <span className="font-semibold tracking-wider truncate">
              {cardStatus?.cardNumber || session?.cardNumber || 'CARD1001'}
            </span>
            <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

