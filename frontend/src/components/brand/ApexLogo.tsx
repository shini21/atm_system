import React from 'react';

type ApexLogoVariant = 'horizontal' | 'stacked' | 'emblem' | 'wordmark';
type ApexLogoTone = 'color' | 'white' | 'mono-blue' | 'mono-graphite' | 'mono-white' | 'mono-black';

export type { ApexLogoVariant, ApexLogoTone };

interface ApexLogoProps {
  variant?: ApexLogoVariant;
  tone?: ApexLogoTone;
  height?: number;
  width?: number;
  className?: string;
  title?: string;
  decorative?: boolean;
}

const TONES: Record<ApexLogoTone, string[]> = {
  color: ['#006FCF', '#003B70', '#E71319', '#003B70'],
  white: ['#FFFFFF', '#FFFFFF', '#E71319', '#FFFFFF'],
  'mono-blue': ['#004B80', '#004B80', '#004B80', '#004B80'],
  'mono-graphite': ['#202B38', '#202B38', '#202B38', '#202B38'],
  'mono-white': ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  'mono-black': ['#000000', '#000000', '#000000', '#000000'],
};

const PATHS = [
  'M32 3L61 32L61 45L32 16L3 45L3 32Z',
  'M32 21L54 43L54 54L32 32L10 54L10 43Z',
  'M32 37L45 50L45 59L32 46L19 59L19 50Z',
];

const WORDMARK_PATHS = [
  'M0 40 15.5 0H24.5L40 40H30.5L27.5 32H12.5L9.5 40ZM20 11 15.5 23H24.5Z',
  'M0 0H24C33 0 38 5 38 12.5S33 25 24 25H9.5V40H0ZM9.5 8.5H23C26 8.5 28 10 28 12.5S26 16.5 23 16.5H9.5Z',
  'M0 0H36V8.5H9.5V15.5H32V24H9.5V31.5H36V40H0Z',
  'M0 0H11L20 15 29 0H40L26 20 40 40H29L20 25 11 40H0L14 20Z',
  'M0 0H23C31 0 36 4 36 10.5C36 15 33.5 18 30 19C34.5 20 38 23.5 38 29C38 36 33 40 24 40H0ZM9.5 8H21.5C24.5 8 26.5 9 26.5 11.2S24.5 14.5 21.5 14.5H9.5ZM9.5 22.5H22.5C26 22.5 28 24 28 26.2S26 32 22.5 32H9.5Z',
  'M0 40 15.5 0H24.5L40 40H30.5L27.5 32H12.5L9.5 40ZM20 11 15.5 23H24.5Z',
  'M0 0H10L28.5 24V0H38V40H28L9.5 16V40H0Z',
  'M0 0H9.5V16L26 0H38L20 18.5 39 40H27L9.5 21.5V40H0Z',
];

const EMBLEM_VIEWBOX = '2 2 60 58';
const WORDMARK_VIEWBOX = '-2 -2 367 44';

const SIZES: Record<ApexLogoVariant, [number, number]> = {
  horizontal: [438.2, 51.8],
  stacked: [367, 190],
  emblem: [60, 58],
  wordmark: [367, 44],
};

const Emblem: React.FC<{ tone: string[]; width?: number; height?: number; className?: string; decorative?: boolean }> = ({
  tone,
  width,
  height,
  className,
  decorative,
}) => (
  <svg
    viewBox={EMBLEM_VIEWBOX}
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : 'Apex Bank emblem'}
    aria-hidden={decorative}
    width={width}
    height={height}
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    {PATHS.map((d, i) => (
      <path key={i} fill={tone[i]} d={d} />
    ))}
  </svg>
);

const Wordmark: React.FC<{ color: string; width?: number; height?: number; className?: string; decorative?: boolean }> = ({
  color,
  width,
  height,
  className,
  decorative,
}) => (
  <svg
    viewBox={WORDMARK_VIEWBOX}
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : 'Apex Bank'}
    aria-hidden={decorative}
    width={width}
    height={height}
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    <g fill={color}>
      <g transform="translate(10 0) skewX(-14)">
        {WORDMARK_PATHS.map((d, i) => (
          <path key={i} fillRule="evenodd" d={d} transform={`translate(${i * 44} 0)`} />
        ))}
      </g>
    </g>
  </svg>
);

const EmblemInline: React.FC<{ tone: string[]; x: number; y: number; width: number; height: number; decorative?: boolean }> = ({
  tone,
  x,
  y,
  width,
  height,
  decorative,
}) => (
  <svg
    viewBox={EMBLEM_VIEWBOX}
    x={x}
    y={y}
    width={width}
    height={height}
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : 'Apex Bank emblem'}
    aria-hidden={decorative}
    preserveAspectRatio="xMidYMid meet"
  >
    {PATHS.map((d, i) => (
      <path key={i} fill={tone[i]} d={d} />
    ))}
  </svg>
);

const WordmarkInline: React.FC<{ color: string; x: number; y: number; width: number; height: number; decorative?: boolean }> = ({
  color,
  x,
  y,
  width,
  height,
  decorative,
}) => (
  <svg
    viewBox={WORDMARK_VIEWBOX}
    x={x}
    y={y}
    width={width}
    height={height}
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : 'Apex Bank'}
    aria-hidden={decorative}
    preserveAspectRatio="xMidYMid meet"
  >
    <g fill={color}>
      <g transform="translate(10 0) skewX(-14)">
        {WORDMARK_PATHS.map((d, i) => (
          <path key={i} fillRule="evenodd" d={d} transform={`translate(${i * 44} 0)`} />
        ))}
      </g>
    </g>
  </svg>
);

export const ApexLogo: React.FC<ApexLogoProps> = ({
  variant = 'horizontal',
  tone = 'color',
  height = 32,
  width,
  className = '',
  title = 'Apex Bank',
  decorative = false,
}) => {
  const t = TONES[tone] || TONES.color;
  const [W, H] = SIZES[variant] || SIZES.horizontal;
  const calculatedWidth = width ?? (height * W) / H;

  if (variant === 'emblem') {
    return <Emblem tone={t} width={calculatedWidth} height={height} className={className} decorative={decorative} />;
  }

  if (variant === 'wordmark') {
    return <Wordmark color={t[3]} width={calculatedWidth} height={height} className={className} decorative={decorative} />;
  }

  if (variant === 'stacked') {
    return (
      <svg
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : title}
        aria-hidden={decorative}
        viewBox="0 0 367 190"
        width={calculatedWidth}
        height={height}
        className={className}
        preserveAspectRatio="xMidYMid meet"
      >
        <EmblemInline tone={t} x={121.6} y={0} width={123.75} height={119.6} decorative={true} />
        <WordmarkInline color={t[3]} x={0} y={146} width={367} height={44} decorative={true} />
      </svg>
    );
  }

  return (
    <svg
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative}
      viewBox="0 0 438.2 51.8"
      width={calculatedWidth}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <EmblemInline tone={t} x={0} y={0} width={53.6} height={51.8} decorative={true} />
      <WordmarkInline color={t[3]} x={71.2} y={3.9} width={367} height={44} decorative={true} />
    </svg>
  );
};

export default ApexLogo;