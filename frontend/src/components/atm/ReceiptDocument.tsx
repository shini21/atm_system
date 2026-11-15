import React from 'react';
import { BrandLogo } from '../brand/BrandLogo';
import type { ReceiptData } from '../../context/HardwareContext';

/** "ACC1001" → "ACC••1001" – never prints more than the last four characters of the account id. */
export const maskAccount = (acc: string): string =>
  acc && acc.length > 4 ? `${acc.slice(0, Math.min(3, acc.length - 4))}••${acc.slice(-4)}` : acc;

const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

const Row: React.FC<{ k: string; v: React.ReactNode; strong?: boolean }> = ({ k, v, strong }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b border-[#DCE3EA] last:border-0">
    <dt className="text-[#697586]">{k}</dt>
    <dd className={`text-right font-mono ${strong ? 'font-semibold text-[#202B38]' : 'text-[#202B38]'}`}>{v}</dd>
  </div>
);

/**
 * Printable Apex Bank receipt. Only fields that exist on the transaction are shown.
 * Status is "Completed" because a receipt is only issued after the backend confirmed the operation.
 */
export const ReceiptDocument: React.FC<{ receipt: ReceiptData }> = ({ receipt }) => (
  <article id="apex-receipt" aria-label="Transaction receipt" className="bg-white text-[#202B38] text-xs">
    <header className="flex flex-col items-center pb-4 border-b-2 border-[#202B38]">
      <BrandLogo variant="horizontal" surface="light" className="w-40 h-[3.4rem]" />
      <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[#697586]">Transaction receipt</p>
    </header>
    <dl className="py-3">
      <Row k="Transaction" v={receipt.type.replace(/_/g, ' ')} strong />
      <Row k="Reference" v={receipt.transactionId} />
      <Row k="Account" v={maskAccount(receipt.accountNumber)} />
      {receipt.cardHolderName && <Row k="Cardholder" v={receipt.cardHolderName} />}
      <Row k="Date & time" v={new Date(receipt.timestamp).toLocaleString('en-IN')} />
      <Row k="Status" v="✓ Completed" />
    </dl>
    <div className="flex justify-between items-baseline py-3 border-y border-[#202B38]">
      <span className="uppercase tracking-wide text-[10px] text-[#697586]">Amount</span>
      <span className="font-mono text-xl font-semibold">{inr(receipt.amount)}</span>
    </div>
    <div className="flex justify-between items-baseline py-2.5">
      <span className="text-[#697586]">Balance after transaction</span>
      <span className="font-mono font-semibold">{inr(receipt.balanceAfter)}</span>
    </div>
    <footer className="pt-3 mt-1 border-t border-dashed border-[#B8C5D3] text-center text-[10px] text-[#697586]">
      APEX BANK · Academic Banking Simulation · No real funds or card data.
    </footer>
  </article>
);
