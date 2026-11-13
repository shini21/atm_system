import React from 'react';
import { CardSlot } from './CardSlot';
import { CashDispenserSlot } from './CashDispenserSlot';
import { ReceiptPrinterSlot } from './ReceiptPrinterSlot';
import { PhysicalKeypad } from './PhysicalKeypad';

export const HardwareConsole: React.FC = () => {
  return (
    <section
      aria-label="ATM Hardware Controls"
      className="w-full mt-4 p-4 rounded-2xl bg-surface/80 backdrop-blur-md border border-border-subtle shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* Card Reader Bay */}
        <div className="flex justify-center">
          <CardSlot />
        </div>

        {/* Note Dispenser Bay (wider) */}
        <div className="md:col-span-1 flex justify-center">
          <CashDispenserSlot />
        </div>

        {/* Receipt Printer Bay */}
        <div className="flex justify-center">
          <ReceiptPrinterSlot />
        </div>

        {/* Physical PIN Keypad Bay */}
        <div className="flex justify-center">
          <PhysicalKeypad />
        </div>
      </div>
    </section>
  );
};

