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
        <span className="text-[10px] font-mono tracking-wider text-tertiary uppercase flex items-center gap-1.5">
          <Banknote className="w-3 h-3 text-secondary" />
          <span>Note Dispenser</span>
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isDispensed
                ? 'bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]'
                : isDispensing
                ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]'
                : 'bg-zinc-600'
            }`}
          />
          <span className="text-[9px] font-mono tracking-tight text-tertiary uppercase">
            {isDispensed
              ? 'CASH READY'
              : isDispensing
              ? 'DISPENSING...'
              : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Outer Dispenser Housing */}
      <div className="relative w-full max-w-[320px] h-20 rounded-xl bg-surface-subdued border border-border-subtle shadow-inner flex flex-col items-center justify-center p-2 overflow-hidden">
        {/* Shutter Door */}
        <motion.div
          animate={{
            height: isDispensing || isDispensed ? 6 : 28,
            backgroundColor: isDispensed ? '#10b981' : '#1f2937',
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="w-full rounded-md shadow-md flex items-center justify-center border border-zinc-700/60 relative"
        >
          {/* Mechanical grooves */}
          <div className="w-3/4 h-[2px] bg-zinc-600/40 rounded-full" />
        </motion.div>

        {/* Note Aperture Slot */}
        <div className="w-full h-3 rounded-full bg-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] my-1 relative flex items-center justify-center overflow-visible">
          {/* Green illumination light when cash is ready */}
          {isDispensed && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="absolute inset-0 bg-emerald-500/30 blur-sm rounded-full"
            />
          )}

          {/* Emerged Cash Bundle */}
          <AnimatePresence>
            {isDispensed && dispensedCash && (
              <motion.div
                initial={{ y: -30, opacity: 0, scale: 0.8 }}
                animate={{ y: 8, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={collectCash}
                className="absolute z-20 cursor-pointer flex flex-col items-center group"
                title="Click to take your cash"
              >
                {/* Visual Stack of Indian Rupee Notes */}
                <div className="relative flex items-center justify-center">
                  {/* ₹500 Note (Stone Green) */}
                  {dispensedCash.breakdown[500] && dispensedCash.breakdown[500] > 0 && (
                    <div className="w-36 h-12 rounded bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 border border-emerald-400/60 shadow-lg flex items-center justify-between px-2.5 text-emerald-100 font-mono text-[11px] transform -rotate-1 select-none">
                      <div className="font-bold tracking-wider">₹500</div>
                      <div className="text-[9px] text-emerald-300">
                        × {dispensedCash.breakdown[500]}
                      </div>
                      <div className="w-4 h-4 rounded-full border border-emerald-400/40 text-[8px] flex items-center justify-center">
                        RBI
                      </div>
                    </div>
                  )}

                  {/* ₹200 Note (Bright Ochre / Orange) */}
                  {dispensedCash.breakdown[200] && dispensedCash.breakdown[200] > 0 && (
                    <div className="w-34 h-11 -mt-9 rounded bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-800 border border-amber-300/60 shadow-md flex items-center justify-between px-2.5 text-amber-100 font-mono text-[11px] transform rotate-1 select-none">
                      <div className="font-bold tracking-wider">₹200</div>
                      <div className="text-[9px] text-amber-200">
                        × {dispensedCash.breakdown[200]}
                      </div>
                      <div className="w-4 h-4 rounded-full border border-amber-400/40 text-[8px] flex items-center justify-center">
                        RBI
                      </div>
                    </div>
                  )}

                  {/* ₹100 Note (Lavender Blue) */}
                  {dispensedCash.breakdown[100] && dispensedCash.breakdown[100] > 0 && (
                    <div className="w-32 h-10 -mt-8 rounded bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-900 border border-indigo-300/60 shadow-md flex items-center justify-between px-2.5 text-indigo-100 font-mono text-[11px] transform -rotate-0.5 select-none">
                      <div className="font-bold tracking-wider">₹100</div>
                      <div className="text-[9px] text-indigo-200">
                        × {dispensedCash.breakdown[100]}
                      </div>
                      <div className="w-4 h-4 rounded-full border border-indigo-400/40 text-[8px] flex items-center justify-center">
                        RBI
                      </div>
                    </div>
                  )}
                </div>

                {/* Collect Cash Pulsing Action Pill */}
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="mt-2 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-[10px] tracking-wide shadow-md flex items-center gap-1.5 transition-transform group-hover:scale-105"
                >
                  <Hand className="w-3 h-3 animate-bounce" />
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

