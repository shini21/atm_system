import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';
import { Receipt, Download, X, Scissors } from 'lucide-react';

export const ReceiptPrinterSlot: React.FC = () => {
  const { receiptState, currentReceipt, collectReceipt } = useHardware();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isPrinting = receiptState === 'printing';
  const isReady = receiptState === 'ready';

  const handleDownloadPdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Label and Status */}
      <div className="flex items-center justify-between w-full max-w-[220px] mb-1.5 px-1">
        <span className="text-[10px] font-mono tracking-wider text-tertiary uppercase flex items-center gap-1.5 font-medium">
          <Receipt className="w-3.5 h-3.5 text-secondary" />
          <span>Receipt Printer</span>
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isReady
                ? 'bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.9)]'
                : isPrinting
                ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.9)]'
                : 'bg-zinc-600'
            }`}
          />
          <span className="text-[9px] font-mono tracking-tight text-tertiary uppercase font-semibold">
            {isReady ? 'SLIP READY' : isPrinting ? 'PRINTING...' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Slit Frame with Brushed Aluminum Rim */}
      <div className="relative w-full max-w-[220px] h-12 rounded-xl bg-surface-subdued border border-border-strong shadow-inner flex items-center justify-center p-1.5 overflow-visible">
        {/* Paper Slit */}
        <div className="w-full h-2 rounded-full bg-black/85 shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] relative border border-black/60" />

        {/* Protruding Thermal Paper */}
        <AnimatePresence>
          {isReady && currentReceipt && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 18, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={() => setIsExpanded(true)}
              className="absolute top-4 z-30 w-48 rounded-b-lg bg-[#FAF8F5] text-zinc-900 border-x border-b border-zinc-300 shadow-xl cursor-pointer p-3 font-mono text-[9px] select-none hover:shadow-2xl transition-all group"
              title="Click to view full receipt or tear"
            >
              {/* Serrated Top Edge */}
              <div className="absolute -top-1.5 left-0 right-0 h-1.5 bg-repeat-x bg-[length:6px_6px] bg-[radial-gradient(circle,transparent_3px,#FAF8F5_3px)]" />

              <div className="text-center font-bold tracking-wider text-[10px] text-zinc-950 border-b border-dashed border-zinc-400 pb-1">
                APEX TOUCH BANKING
              </div>
              <div className="flex justify-between text-zinc-600 mt-1.5">
                <span>TXN:</span>
                <span className="font-semibold text-zinc-950">{currentReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>TYPE:</span>
                <span className="font-semibold text-zinc-950 truncate max-w-[90px]">{currentReceipt.type}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>AMOUNT:</span>
                <span className="font-bold text-zinc-950">
                  ₹{currentReceipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>BALANCE:</span>
                <span className="font-semibold text-zinc-950">
                  ₹{currentReceipt.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* View / Tear hint */}
              <div className="mt-2.5 pt-1 border-t border-zinc-200 flex items-center justify-between text-[8px] text-zinc-500 font-sans">
                <span className="text-blue-600 font-medium group-hover:underline">View & Print</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    collectReceipt();
                  }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 cursor-pointer font-medium"
                >
                  <Scissors className="w-2.5 h-2.5" />
                  <span>Tear</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Modal Receipt View */}
      <AnimatePresence>
        {isExpanded && currentReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[#FAF8F5] text-zinc-900 p-6 shadow-2xl font-mono text-xs border border-zinc-300 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-zinc-200 text-zinc-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pb-3 border-b border-dashed border-zinc-400">
                <div className="text-base font-bold tracking-tight text-zinc-950">
                  APEX TOUCH BANKING
                </div>
                <div className="text-[10px] text-zinc-500">MUMBAI CENTRAL #04 • TERMINAL X-9000</div>
                <div className="text-[10px] text-zinc-500">{new Date(currentReceipt.timestamp).toLocaleString()}</div>
              </div>

              <div className="py-4 space-y-2 text-zinc-700">
                <div className="flex justify-between">
                  <span>TRANSACTION ID:</span>
                  <span className="font-semibold text-zinc-950">{currentReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>ACCOUNT NUMBER:</span>
                  <span className="font-semibold text-zinc-950">{currentReceipt.accountNumber}</span>
                </div>
                {currentReceipt.cardHolderName && (
                  <div className="flex justify-between">
                    <span>CARDHOLDER:</span>
                    <span className="font-semibold text-zinc-950">{currentReceipt.cardHolderName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>OPERATION:</span>
                  <span className="font-bold text-zinc-950">{currentReceipt.type}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-zinc-300 font-bold text-zinc-950">
                  <span>TRANSACTION AMOUNT:</span>
                  <span>₹{currentReceipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-zinc-800">
                  <span>AVAILABLE BALANCE:</span>
                  <span>₹{currentReceipt.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="py-2.5 border-t border-b border-dashed border-zinc-400 flex flex-col items-center gap-1">
                <div className="h-8 w-48 bg-[repeating-linear-gradient(90deg,#18181b_0,#18181b_2px,transparent_2px,transparent_4px,#18181b_4px,#18181b_7px,transparent_7px,transparent_9px)]" />
                <span className="text-[9px] tracking-widest text-zinc-500">{currentReceipt.transactionId}</span>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    collectReceipt();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  Tear & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
