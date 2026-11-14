import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';
import { Banknote, Hand } from 'lucide-react';

export const CashDispenserSlot: React.FC = () => {
  const { dispenserState, dispensedCash, collectCash } = useHardware();

  const isDispensing = dispenserState === 'dispensing';
  const isDispensed = dispenserState === 'dispensed';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Label and Status */}
      <div className="flex items-center justify-between w-full max-w-[320px] mb-1.5 px-1">
        <span className="text-[10px] font-mono tracking-wider text-tertiary uppercase flex items-center gap-1.5 font-medium">
          <Banknote className="w-3.5 h-3.5 text-secondary" />
          <span>Note Dispenser</span>
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isDispensed
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                : isDispensing
                ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.9)]'
                : 'bg-zinc-600'
            }`}
          />
          <span className="text-[9px] font-mono tracking-tight text-tertiary uppercase font-semibold">
            {isDispensed
              ? 'CASH READY'
              : isDispensing
              ? 'DISPENSING...'
              : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Outer Dispenser Housing with Bezel Rim */}
      <div className="relative w-full max-w-[320px] h-20 rounded-xl bg-surface-subdued border border-border-strong shadow-inner flex flex-col items-center justify-center p-2 overflow-hidden">
        {/* Shutter Door */}
        <motion.div
          animate={{
            height: isDispensing || isDispensed ? 6 : 28,
            backgroundColor: isDispensed ? '#059669' : '#1e293b',
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-full rounded-md shadow-md flex items-center justify-center border border-zinc-700/70 relative"
        >
          {/* Mechanical grooves */}
          <div className="w-3/4 h-[2px] bg-zinc-500/50 rounded-full" />
        </motion.div>

        {/* Note Aperture Slot */}
        <div className="w-full h-3 rounded-full bg-black/85 shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] my-1 relative flex items-center justify-center overflow-visible border border-black/60">
          {/* Green illumination light when cash is ready */}
          {isDispensed && (
            <motion.div
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="absolute inset-0 bg-emerald-500/35 blur-sm rounded-full"
            />
          )}

          {/* Emerged Cash Bundle */}
          <AnimatePresence>
            {isDispensed && dispensedCash && (
              <motion.div
                initial={{ y: -30, opacity: 0, scale: 0.85 }}
                animate={{ y: 8, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                onClick={collectCash}
                className="absolute z-20 cursor-pointer flex flex-col items-center group"
                title="Click to take your cash"
              >
                {/* Visual Stack of Authentic Indian Rupee Banknotes */}
                <div className="relative flex items-center justify-center">
                  {/* ₹500 Note (Stone Green) */}
                  {dispensedCash.breakdown[500] && dispensedCash.breakdown[500] > 0 && (
                    <div className="w-38 h-12 rounded bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 border border-emerald-400/70 shadow-xl flex items-center justify-between px-3 text-emerald-100 font-mono text-[11px] transform -rotate-1 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs tracking-wider">₹500</span>
                        <div className="w-1.5 h-6 bg-emerald-400/40 rounded-xs" />
                      </div>
                      <div className="text-[10px] text-emerald-200 font-semibold px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-400/40">
                        × {dispensedCash.breakdown[500]}
                      </div>
                      <div className="w-4 h-4 rounded-full border border-emerald-400/50 text-[8px] flex items-center justify-center font-bold">
                        RBI
                      </div>
                    </div>
                  )}

                  {/* ₹200 Note (Bright Ochre / Orange) */}
                  {dispensedCash.breakdown[200] && dispensedCash.breakdown[200] > 0 && (
                    <div className="w-36 h-11 -mt-9 rounded bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-900 border border-amber-300/70 shadow-lg flex items-center justify-between px-3 text-amber-100 font-mono text-[11px] transform rotate-1 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs tracking-wider">₹200</span>
                        <div className="w-1.5 h-5 bg-amber-300/40 rounded-xs" />
                      </div>
                      <div className="text-[10px] text-amber-200 font-semibold px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-400/40">
                        × {dispensedCash.breakdown[200]}
                      </div>
                      <div className="w-4 h-4 rounded-full border border-amber-400/50 text-[8px] flex items-center justify-center font-bold">
                        RBI
                      </div>
                    </div>
                  )}

                  {/* ₹100 Note (Lavender Blue) */}
                  {dispensedCash.breakdown[100] && dispensedCash.breakdown[100] > 0 && (
                    <div className="w-34 h-10 -mt-8 rounded bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-950 border border-indigo-300/70 shadow-lg flex items-center justify-between px-3 text-indigo-100 font-mono text-[11px] transform -rotate-0.5 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs tracking-wider">₹100</span>
                        <div className="w-1.5 h-4 bg-indigo-300/40 rounded-xs" />
                      </div>
                      <div className="text-[10px] text-indigo-200 font-semibold px-1.5 py-0.2 rounded bg-indigo-950/60 border border-indigo-400/40">
                        × {dispensedCash.breakdown[100]}
                      </div>
                      <div className="w-4 h-4 rounded-full border border-indigo-400/50 text-[8px] flex items-center justify-center font-bold">
                        RBI
                      </div>
                    </div>
                  )}
                </div>

                {/* Collect Cash Pulsing Action Pill */}
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="mt-2.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] tracking-wide shadow-lg flex items-center gap-1.5 transition-transform group-hover:scale-105 border border-emerald-400/40"
                >
                  <Hand className="w-3.5 h-3.5 animate-bounce" />
                  <span>Take Cash (₹{dispensedCash.amount.toLocaleString('en-IN')})</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

