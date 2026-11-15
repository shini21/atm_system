/**
 * Apex card presentation system.
 *
 * Two independent dimensions:
 *  - Banking TIER (Signature / Elite / Privilege / Platinum) – identity.
 *  - Visual THEME (six approved designs) – presentation only.
 *
 * NOTE: the current backend card model (CardStatus) carries no tier or payment-network field.
 * Tier is therefore an optional prop that defaults to "none" and renders nothing; it is never
 * inferred from account type or balance. Likewise the network slot shows an explicit placeholder
 * instead of a fabricated Visa / Mastercard / RuPay mark.
 */
export type CardTier = 'signature' | 'elite' | 'privilege' | 'platinum';
export type CardThemeId =
  | 'institutional-black'
  | 'royal-navy'
  | 'platinum'
  | 'signature-burgundy'
  | 'modern-blue'
  | 'private-wealth';

export interface CardTheme {
  id: CardThemeId;
  label: string;
  /** CSS background for the card face */
  face: string;
  /** primary text colour on the face */
  ink: string;
  /** secondary text colour on the face */
  inkMuted: string;
  /** monogram colourway */
  mono: 'white' | 'black';
  /** EMV chip gradient */
  chip: string;
  /** whether the face is light (affects sheen + edge) */
  light: boolean;
}

export const CARD_TIERS: { id: CardTier; label: string }[] = [
  { id: 'signature', label: 'Signature' },
  { id: 'elite', label: 'Elite' },
  { id: 'privilege', label: 'Privilege' },
  { id: 'platinum', label: 'Platinum' },
];

const GOLD_CHIP = 'linear-gradient(135deg,#F1DFB0 0%,#D7B979 38%,#B8964F 62%,#E6CE96 100%)';
const SILVER_CHIP = 'linear-gradient(135deg,#F2F4F7 0%,#C5CAD2 40%,#9AA1AD 65%,#DDE1E7 100%)';

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'institutional-black',
    label: 'Institutional Black',
    face: 'linear-gradient(145deg,#26282D 0%,#17181B 45%,#0C0C0E 100%)',
    ink: '#F3F6FA', inkMuted: 'rgba(243,246,250,0.72)', mono: 'white', chip: GOLD_CHIP, light: false,
  },
  {
    id: 'royal-navy',
    label: 'Atlantic Blue',
    face: 'linear-gradient(145deg, #1D3A6B 0%, #003B70 50%, #001F45 100%)',
    ink: '#F3F6FA', inkMuted: 'rgba(243,246,250,0.75)', mono: 'white', chip: GOLD_CHIP, light: false,
  },
  {
    id: 'platinum',
    label: 'Platinum',
    face: 'linear-gradient(145deg,#F4F5F7 0%,#D9DDE3 48%,#B9BFC9 100%)',
    ink: '#17243B', inkMuted: 'rgba(23,36,59,0.72)', mono: 'black', chip: SILVER_CHIP, light: true,
  },
  {
    id: 'signature-burgundy',
    label: 'Signature Burgundy',
    face: 'linear-gradient(145deg,#6B2236 0%,#4A1626 50%,#2B0B16 100%)',
    ink: '#F8EEE9', inkMuted: 'rgba(248,238,233,0.72)', mono: 'white', chip: GOLD_CHIP, light: false,
  },
  {
    id: 'modern-blue',
    label: 'Apex Blue',
    face: 'linear-gradient(145deg, #1A7FD4 0%, #006FCF 50%, #004A96 100%)',
    ink: '#FFFFFF', inkMuted: 'rgba(255,255,255,0.80)', mono: 'white', chip: SILVER_CHIP, light: false,
  },
  {
    id: 'private-wealth',
    label: 'Private Wealth',
    face: 'linear-gradient(145deg,#4A3F2C 0%,#2C261B 50%,#17140E 100%)',
    ink: '#F2E6C9', inkMuted: 'rgba(242,230,201,0.72)', mono: 'white', chip: GOLD_CHIP, light: false,
  },
];

export const DEFAULT_CARD_THEME: CardThemeId = 'institutional-black';

export const getCardTheme = (id: CardThemeId): CardTheme =>
  CARD_THEMES.find((t) => t.id === id) ?? CARD_THEMES[0];

/** "CARD1001" → "1001". Falls back to the trailing four characters. Never exposes more than 4 digits. */
export const lastFour = (cardNumber: string): string => {
  const digits = (cardNumber || '').replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);
  return (cardNumber || '').slice(-4).padStart(4, '•');
};

/** ISO date ("2028-12-31") → "12/28". Passes through values that are already MM/YY. */
export const formatExpiry = (expiry?: string): string => {
  if (!expiry) return '—';
  const m = /^(\d{4})-(\d{2})/.exec(expiry);
  if (m) return `${m[2]}/${m[1].slice(2)}`;
  return expiry;
};
