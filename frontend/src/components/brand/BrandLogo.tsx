import React from 'react';
import { ApexLogo, type ApexLogoVariant, type ApexLogoTone } from './ApexLogo';

/**
 * Apex Bank Brand Logo — backward-compatible wrapper around the new centralized ApexLogo.
 *
 * Maps legacy `surface` and `variant` props to the new `tone` and `variant` system.
 *
 * surface="light"  → tone="color" (Apex Blue / Atlantic Blue / Red emblem on light)
 * surface="dark"   → tone="white" (White emblem + wordmark on dark)
 * surface="navy"   → tone="mono-blue" (Single blue tone for navy backgrounds)
 *
 * variant="horizontal" → variant="horizontal" (emblem + wordmark side by side)
 * variant="vertical"   → variant="stacked" (emblem above wordmark)
 * variant="monogram"   → variant="emblem" (standalone chevron emblem)
 */
export type BrandSurface = 'light' | 'dark' | 'navy';
export type BrandVariant = 'horizontal' | 'vertical' | 'monogram';

const SURFACE_TO_TONE: Record<BrandSurface, ApexLogoTone> = {
  light: 'color',
  dark: 'white',
  navy: 'mono-blue',
};

const VARIANT_MAP: Record<BrandVariant, ApexLogoVariant> = {
  horizontal: 'horizontal',
  vertical: 'stacked',
  monogram: 'emblem',
};

interface BrandLogoProps {
  variant?: BrandVariant;
  surface?: BrandSurface;
  /** Kept for backward compatibility; no longer used with new outlined artwork. */
  plate?: boolean;
  /** Single-colour monogram for cards/embossing. Monogram only. */
  mono?: 'white' | 'black';
  className?: string;
  /** Decorative usage (e.g. next to visible text) hides it from assistive tech. */
  decorative?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  surface = 'light',
  plate: _plate = false,
  mono,
  className = '',
  decorative = false,
}) => {
  const tone = mono ? (mono === 'white' ? 'mono-white' : 'mono-black') : SURFACE_TO_TONE[surface];
  const mappedVariant = VARIANT_MAP[variant];

  return (
    <ApexLogo
      variant={mappedVariant}
      tone={tone}
      className={className}
      decorative={decorative}
      title="Apex Bank"
    />
  );
};

export default BrandLogo;