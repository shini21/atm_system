import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrandLogo } from '../components/brand/BrandLogo';
import { ApexCard } from '../components/cards/ApexCard';
import { ReceiptDocument, maskAccount } from '../components/atm/ReceiptDocument';
import { CARD_THEMES, formatExpiry, lastFour } from '../utils/cardThemes';

describe('Official Apex brand identity', () => {
  it('renders the original lockup SVG inline with live brand text and untouched geometry', () => {
    const { container } = render(<BrandLogo variant="horizontal" surface="light" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('-20 -10 320 120');
    expect(container.innerHTML).toContain('M30.5 6 4 59h11l15.5-31zM33.5 6 60 59H49L33.5 28z'); // official A
    expect(container.innerHTML).toContain('M22.7 43h18.6l2.5 5H20.2z'); // official gold crossbar
    expect(container.textContent).toContain('APEX');
    expect(container.innerHTML).toContain('Cormorant Garamond');
    expect(container.innerHTML).toContain('Instrument Sans');
  });

  it('drops only the opaque background plate unless asked to keep it', () => {
    const bare = render(<BrandLogo variant="monogram" surface="dark" />).container.innerHTML;
    const plated = render(<BrandLogo variant="monogram" surface="dark" plate />).container.innerHTML;
    expect(bare).not.toContain('<rect');
    expect(plated).toContain('<rect');
  });
});

describe('Apex card system', () => {
  it('uses the exact bank-card aspect ratio and exposes only the last four digits', () => {
    render(<ApexCard cardNumber="CARD1001" cardHolderName="Aarav Sharma" expiryDate="2028-12-31" />);
    const card = screen.getByTestId('apex-card');
    expect(card.style.aspectRatio).toBe('85.6 / 53.98');
    expect(screen.getByLabelText('Card ending 1001')).toBeInTheDocument();
    expect(card.textContent).not.toMatch(/CARD1001/);
    expect(card.textContent).toContain('12/28');
  });

  it('defaults to Institutional Black with no tier, and keeps theme and tier independent', () => {
    const { rerender } = render(<ApexCard cardNumber="CARD1002" />);
    expect(screen.getByTestId('apex-card').dataset.theme).toBe('institutional-black');
    expect(screen.getByTestId('apex-card').dataset.tier).toBe('none');
    rerender(<ApexCard cardNumber="CARD1002" theme="royal-navy" tier="elite" />);
    expect(screen.getByTestId('apex-card').dataset.theme).toBe('royal-navy');
    expect(screen.getByTestId('apex-card').dataset.tier).toBe('elite');
  });

  it('never fabricates a payment network: shows a labelled placeholder when the model has none', () => {
    render(<ApexCard cardNumber="CARD1001" />);
    expect(screen.getByTestId('card-network').textContent).toMatch(/NETWORK/);
  });

  it('flips with an aria-pressed control and the back shows no CVV or full number', () => {
    render(<ApexCard cardNumber="CARD1001" accountType="Savings Account" />);
    const flip = screen.getByRole('button', { name: /show card back/i });
    expect(flip).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(flip);
    expect(screen.getByRole('button', { name: /show card front/i })).toHaveAttribute('aria-pressed', 'true');
    const back = document.querySelector('[data-face="back"]')!;
    expect(back.textContent).not.toMatch(/cvv|cvc/i);
    expect(back.textContent).toContain('ending 1001');
  });

  it('ships all six approved themes', () => {
    expect(CARD_THEMES.map((t) => t.id)).toEqual([
      'institutional-black', 'royal-navy', 'platinum', 'signature-burgundy', 'modern-blue', 'private-wealth',
    ]);
    expect(lastFour('CARD1001')).toBe('1001');
    expect(formatExpiry('2025-01-01')).toBe('01/25');
  });
});

describe('Receipt document', () => {
  it('masks the account, shows only real fields, and uses the official logo', () => {
    render(
      <ReceiptDocument
        receipt={{ transactionId: 'TXN-1001', type: 'WITHDRAWAL', amount: 1500, balanceAfter: 3500, timestamp: '2026-01-02T10:00:00Z', accountNumber: 'ACC1001' }}
      />
    );
    expect(maskAccount('ACC1001')).toBe('ACC••1001');
    expect(screen.queryByText('ACC1001')).toBeNull();
    expect(screen.getByText('TXN-1001')).toBeInTheDocument();
    expect(screen.getByText('✓ Completed')).toBeInTheDocument();
    expect(screen.getByTestId('apex-brand-logo')).toBeInTheDocument();
    expect(screen.getByText(/No real funds or card data/)).toBeInTheDocument();
  });
});
