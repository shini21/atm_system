import React from 'react';
import horizontalDark from '../../assets/brand/lockup-horizontal/apex-lockup-horizontal-dark.svg?raw';
import horizontalWhite from '../../assets/brand/lockup-horizontal/apex-lockup-horizontal-white.svg?raw';
import horizontalNavy from '../../assets/brand/lockup-horizontal/apex-lockup-horizontal-navy.svg?raw';
import verticalDark from '../../assets/brand/lockup-vertical/apex-lockup-vertical-dark.svg?raw';
import verticalWhite from '../../assets/brand/lockup-vertical/apex-lockup-vertical-white.svg?raw';
import verticalNavy from '../../assets/brand/lockup-vertical/apex-lockup-vertical-navy.svg?raw';
import monogramDark from '../../assets/brand/monogram/apex-monogram-dark.svg?raw';
import monogramWhite from '../../assets/brand/monogram/apex-monogram-white.svg?raw';
import monogramNavy from '../../assets/brand/monogram/apex-monogram-navy.svg?raw';
import monogramMonoWhite from '../../assets/brand/monogram/apex-monogram-mono-white.svg?raw';
import monogramMonoBlack from '../../assets/brand/monogram/apex-monogram-mono-black.svg?raw';

/**
 * Official Apex Bank identity, rendered from the supplied SVG files.
 *
 * The lockups use live <text> (Cormorant Garamond 600 / Instrument Sans 500). An <img> cannot see
 * the page's web fonts, so the original SVG markup is inlined instead; the geometry, text and
 * colours are untouched. Only the opaque background <rect> is removed (unless `plate` is set) so
 * the mark can sit on any surface of the matching tone.
 *
 * surface="light"  → obsidian mark + gold crossbar (official "white" artwork)
 * surface="dark"   → white mark + gold crossbar    (official "dark" artwork)
 * surface="navy"   → white mark + platinum crossbar (official "navy" artwork)
 */
export type BrandSurface = 'light' | 'dark' | 'navy';
export type BrandVariant = 'horizontal' | 'vertical' | 'monogram';

const SOURCES: Record<BrandVariant, Record<BrandSurface, string>> = {
  horizontal: { light: horizontalWhite, dark: horizontalDark, navy: horizontalNavy },
  vertical: { light: verticalWhite, dark: verticalDark, navy: verticalNavy },
  monogram: { light: monogramWhite, dark: monogramDark, navy: monogramNavy },
};

const stripPlate = (svg: string) => svg.replace(/<rect\b[^>]*\/>\s*/, '');

interface BrandLogoProps {
  variant?: BrandVariant;
  surface?: BrandSurface;
  /** Keep the official background plate from the source file. */
  plate?: boolean;
  /** Single-colour monogram (cards, embossing). Monogram only. */
  mono?: 'white' | 'black';
  className?: string;
  /** Decorative usage (e.g. next to visible text) hides it from assistive tech. */
  decorative?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  surface = 'light',
  plate = false,
  mono,
  className = '',
  decorative = false,
}) => {
  let svg = variant === 'monogram' && mono
    ? mono === 'white' ? monogramMonoWhite : monogramMonoBlack
    : SOURCES[variant][surface];
  if (!plate) svg = stripPlate(svg);
  // Size via CSS (width/height on the wrapper); the SVG keeps its own viewBox so it never distorts.
  svg = svg.replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ');
  if (decorative) svg = svg.replace(/ role="img" aria-label="Apex Bank"/, ' aria-hidden="true"');

  return (
    <span
      className={`inline-block leading-none ${className}`}
      data-testid="apex-brand-logo"
      data-variant={variant}
      data-surface={surface}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
