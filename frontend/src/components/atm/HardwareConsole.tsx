import React from 'react';
import { CardSlot } from './CardSlot';
import { CashDispenserSlot } from './CashDispenserSlot';
import { ReceiptPrinterSlot } from './ReceiptPrinterSlot';
import { PhysicalKeypad } from './PhysicalKeypad';

export const HardwareConsole: React.FC = () => {
  return (
    <section
      aria-label="ATM Hardware Controls"
      className="w-full mt-4 p-3 sm:p-4 rounded-xl bg-chassis-bezel/40 border border-border-strong shadow-pocket overflow-x-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 sm:gap-6 items-center">
        {/* Column 1: card reader above receipt printer */}
        <div className="flex flex-col items-center gap-4 w-full">
          <CardSlot />
          <ReceiptPrinterSlot />
        </div>

        {/* Column 2: cash dispenser */}
        <div className="flex justify-center w-full">
          <CashDispenserSlot />
        </div>

        {/* Column 3: PIN pad */}
        <div className="flex justify-center w-full md:col-span-2 lg:col-span-1">
          <PhysicalKeypad />
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-tertiary">
        Hardware shown here is simulated; it reflects application state only.
      </p>
    </section>
  );
};

