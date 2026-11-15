import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrandLogo } from '../components/brand/BrandLogo';
import { ApexCard } from '../components/cards/ApexCard';
import { ReceiptDocument, maskAccount } from '../components/atm/ReceiptDocument';
import { CARD_THEMES, formatExpiry, lastFour } from '../utils/cardThemes';

describe('Official Apex brand identity (Round 5 Wordmark + Round 6 Refinement 1 Variant B)', () => {
  it('renders the approved horizontal lockup with nested chevron emblem and outlined wordmark', () => {
    const { container } = render(<BrandLogo variant="horizontal" surface="light" />);
    const svg = container.querySelector('svg')!;
    // New approved horizontal lockup viewBox
    expect(svg.getAttribute('viewBox')).toBe('0 0 438.2 51.8');
    // Emblem: three nested chevron paths with correct colors
    expect(container.innerHTML).toContain('M32 3L61 32L61 45L32 16L3 45L3 32Z'); // outer chevron
    expect(container.innerHTML).toContain('M32 21L54 43L54 54L32 32L10 54L10 43Z'); // middle chevron
    expect(container.innerHTML).toContain('M32 37L45 50L45 59L32 46L19 59L19 50Z'); // inner chevron
    // Approved emblem colors: #006FCF, #003B70, #E71319
    expect(container.innerHTML).toContain('#006FCF');
    expect(container.innerHTML).toContain('#003B70');
    expect(container.innerHTML).toContain('#E71319');
    // Wordmark: outlined italic APEX BANK (no font dependency)
    expect(container.innerHTML).toContain('fill-rule="evenodd"');
    // No Cormorant Garamond or Instrument Sans font references in new outlined artwork
    expect(container.innerHTML).not.toContain('Cormorant Garamond');
    expect(container.innerHTML).not.toContain('Instrument Sans');
  });

  it('renders the standalone emblem (monogram) correctly for dark surfaces', () => {
    const { container } = render(<BrandLogo variant="monogram" surface="dark" />);
    const svg = container.querySelector('svg')!;
    // Emblem viewBox
    expect(svg.getAttribute('viewBox')).toBe('2 2 60 58');
    // White chevrons with red inner accent for dark surface
    expect(container.innerHTML).toContain('#FFFFFF');
    expect(container.innerHTML).toContain('#E71319');
  });

  it('drops the background plate (not used in new outlined artwork)', () => {
    const bare = render(<BrandLogo variant="monogram" surface="dark" />).container.innerHTML;
    const plated = render(<BrandLogo variant="monogram" surface="dark" plate />).container.innerHTML;
    // New artwork has no opaque background rect
    expect(bare).not.toContain('<rect');
    expect(plated).not.toContain('<rect');
  });

  it('renders stacked variant with emblem above wordmark', () => {
    const { container } = render(<BrandLogo variant="vertical" surface="light" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 367 190');
    // Contains both emblem and wordmark
    expect(container.innerHTML).toContain('M32 3L61 32L61 45L32 16L3 45L3 32Z');
    expect(container.innerHTML).toContain('fill-rule="evenodd"');
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
    expect(screen.getByTestId('card-network').textContent).toMatch(/N\/A/);
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
    // New BrandLogo renders as SVG with role="img" but doesn't use data-testid
    // Check for the logo via its aria-label instead
    expect(screen.getByRole('img', { name: 'Apex Bank' })).toBeInTheDocument();
    expect(screen.getByText(/No real funds or card data/)).toBeInTheDocument();
  });
});