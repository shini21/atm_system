import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';
import { Receipt, Download, Scissors } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ReceiptDocument, maskAccount } from './ReceiptDocument';

export const ReceiptPrinterSlot: React.FC = () => {
  const { receiptState, currentReceipt, collectReceipt } = useHardware();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isPrinting = receiptState === 'printing';
  const isReady = receiptState === 'ready';

  return (
    <div className="flex flex-col items-center w-full">
      {/* Label and Status */}
      <div className="flex items-center justify-between w-full max-w-[220px] mb-1.5 px-1">
        <span className="text-[10px] font-semibold tracking-[0.14em] text-secondary uppercase flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-secondary" />
          <span>Receipt printer</span>
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isReady
                ? 'bg-warning'
                : isPrinting
                ? 'bg-warning animate-pulse'
                : 'bg-success'
            }`}
          />
          <span className="text-[10px] font-medium text-secondary">
            {isReady ? 'Slip ready' : isPrinting ? 'Printing…' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Slit Frame with Brushed Aluminum Rim */}
      <div className="relative w-full max-w-[220px] h-12 rounded-lg flex items-center justify-center p-1.5 overflow-visible" style={{ background: 'linear-gradient(180deg, #D8E0E8, #C0CDD8)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.75), inset 0 -1px 0 rgba(23,43,69,.18)' }}>
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
                APEX BANK
              </div>
              <div className="flex justify-between text-zinc-600 mt-1.5">
                <span>TXN:</span>
                <span className="font-semibold text-zinc-950">{currentReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>ACCT:</span>
                <span className="font-semibold text-zinc-950">{maskAccount(currentReceipt.accountNumber)}</span>
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
                <span className="text-zinc-700 font-medium group-hover:underline">View & Print</span>
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

      {/* Full receipt (focus-managed dialog) */}
      <Modal isOpen={isExpanded && !!currentReceipt} onClose={() => setIsExpanded(false)} title="Receipt" description="Simulated receipt printer output" maxWidth="sm">
        {currentReceipt && (
          <>
            <div className="rounded-control border border-border-subtle overflow-hidden p-4 bg-white">
              <ReceiptDocument receipt={currentReceipt} />
            </div>
            <div className="pt-4 flex gap-2">
              <Button variant="primary" className="flex-1" icon={<Download className="w-4 h-4" />} onClick={() => window.print()}>
                Print receipt
              </Button>
              <Button variant="outline" onClick={() => { setIsExpanded(false); collectReceipt(); }}>
                Tear &amp; close
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
