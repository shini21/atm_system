import React from 'react';
import { motion } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';
import { useAuth } from '../../context/AuthContext';
import { CreditCard } from 'lucide-react';

export const CardSlot: React.FC = () => {
  const { cardSlotState } = useHardware();
  const { session, cardStatus } = useAuth();

  const getLedColor = () => {
    switch (cardSlotState) {
      case 'inserted':
        return 'bg-blue-500 shadow-[0_0_8px_#3b82f6]';
      case 'reading':
        return 'bg-amber-500 animate-ping shadow-[0_0_8px_#f59e0b]';
      case 'blocked':
        return 'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]';
      case 'ejected':
        return 'bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]';
      case 'empty':
      default:
        return 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]';
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
        return 'INSERT CARD';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Label and Status LED */}
      <div className="flex items-center justify-between w-full max-w-[220px] mb-1.5 px-1">
        <span className="text-[10px] font-mono tracking-wider text-tertiary uppercase flex items-center gap-1.5">
          <CreditCard className="w-3 h-3 text-secondary" />
          <span>Card Reader</span>
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${getLedColor()} transition-colors duration-300`} />
          <span className="text-[9px] font-mono tracking-tight text-tertiary uppercase">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Physical Slot Bezel */}
      <div className="relative w-full max-w-[220px] h-10 rounded-lg bg-surface-subdued border border-border-subtle shadow-inner flex items-center justify-center p-1 overflow-hidden">
        {/* Slot Aperture */}
        <div className="w-full h-2 rounded-full bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative flex items-center justify-center">
          {/* Status Line Light inside slot */}
          <div
            className={`w-16 h-[2px] rounded-full ${
              cardSlotState === 'inserted'
                ? 'bg-blue-400/80'
                : cardSlotState === 'blocked'
                ? 'bg-rose-400/80'
                : 'bg-emerald-400/80 animate-pulse'
            }`}
          />
        </div>

        {/* Inserted Card Graphic Peek */}
        {(cardSlotState === 'inserted' || session?.authenticated) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-1 w-28 h-6 rounded-t-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 border-t border-x border-amber-400/40 shadow-md flex items-center justify-between px-2 text-[9px] text-amber-200 font-mono select-none"
          >
            <div className="w-3 h-2 rounded bg-amber-400/80 border border-amber-300/60" />
            <span>{cardStatus?.cardNumber || session?.cardNumber || 'CARD'}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

