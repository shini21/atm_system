import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Banknote, CheckCircle2 } from 'lucide-react';

interface CashDispenserProps {
  mode: 'idle' | 'dispensing' | 'ready' | 'depositing' | 'accepted';
  amount?: number;
  onTakeCash?: () => void;
}

export const CashDispenser: React.FC<CashDispenserProps> = ({
  mode,
  amount,
  onTakeCash,
}) => {
  const isDispensing = mode === 'dispensing';
  const isReady = mode === 'ready';
  const isDepositing = mode === 'depositing';
  const isAccepted = mode === 'accepted';

  return (
    <div className="w-full max-w-md mx-auto my-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl flex flex-col items-center">
      {/* LED Status Light */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            isReady || isAccepted
              ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
              : isDispensing || isDepositing
              ? 'bg-amber-400 animate-ping'
              : 'bg-slate-600'
          }`}
        />
        <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold">
          {mode === 'idle' && 'Cash Slot Ready'}
          {isDispensing && 'Counting & Dispensing Cash...'}
          {isReady && 'Cash Ready – Please Collect'}
          {isDepositing && 'Processing Deposit Feed...'}
          {isAccepted && 'Deposit Verified & Accepted'}
        </span>
      </div>

      {/* Cash Slot Bezel */}
      <div className="relative w-full h-14 bg-gradient-to-b from-slate-900 to-black rounded-lg border-2 border-slate-700/80 shadow-inner flex items-center justify-center overflow-hidden">
        {/* Shutter slit */}
        <div className="w-4/5 h-2 bg-slate-950 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-slate-800" />

        {/* Currency Notes Animation */}
        <AnimatePresence>
          {(isDispensing || isReady) && (
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={onTakeCash}
              className={`absolute cursor-pointer flex items-center gap-2 px-6 py-2 rounded-md bg-emerald-600/90 text-white font-mono font-bold shadow-lg border border-emerald-400/50 ${
                isReady ? 'animate-bounce' : ''
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span>₹{amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              {isReady && <span className="text-xs font-normal underline ml-1">Take Cash</span>}
            </motion.div>
          )}

          {isAccepted && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute flex items-center gap-2 text-emerald-400 font-semibold text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Cash Credited to Account</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

