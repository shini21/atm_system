import React from 'react';
import { CardSlot } from './CardSlot';
import { CashDispenserSlot } from './CashDispenserSlot';
import { ReceiptPrinterSlot } from './ReceiptPrinterSlot';
import { PhysicalKeypad } from './PhysicalKeypad';

export const HardwareConsole: React.FC = () => {
  return (
    <section
      aria-label="ATM Hardware Controls"
      className="w-full mt-4 p-3 sm:p-4 rounded-2xl bg-surface/80 backdrop-blur-md border border-border-subtle shadow-md overflow-x-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
        {/* Card Reader Bay */}
        <div className="flex justify-center w-full">
          <CardSlot />
        </div>

        {/* Note Dispenser Bay */}
        <div className="flex justify-center w-full">
          <CashDispenserSlot />
        </div>

        {/* Receipt Printer Bay */}
        <div className="flex justify-center w-full">
          <ReceiptPrinterSlot />
        </div>

        {/* Physical PIN Keypad Bay */}
        <div className="flex justify-center w-full">
          <PhysicalKeypad />
        </div>
      </div>
    </section>
  );
};

