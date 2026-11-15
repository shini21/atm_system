import React from 'react';

type NetworkType = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'discover' | 'unionpay' | 'jcb' | 'diners';

interface NetworkLogoProps {
  network: NetworkType;
  variant?: 'color' | 'white' | 'mono';
  size?: number;
  className?: string;
}

const NETWORK_SVGS: Record<NetworkType, React.FC<{ variant?: 'color' | 'white' | 'mono'; className?: string; width?: number; height?: number }>> = {
  visa: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="Visa" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <defs>
          <linearGradient id="visaBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A1F71" />
            <stop offset="100%" stopColor="#00319C" />
          </linearGradient>
          <linearGradient id="visaGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F7B500" />
            <stop offset="100%" stopColor="#E6A400" />
          </linearGradient>
        </defs>
        {isWhite ? (
          <>
            <rect x="0" y="0" width="160" height="48" fill="#FFFFFF" />
            <rect x="0" y="48" width="160" height="48" fill="#F7F7F7" />
          </>
        ) : (
          <>
            <rect x="0" y="0" width="160" height="48" fill="url(#visaBlue)" />
            <rect x="0" y="48" width="160" height="48" fill="url(#visaGold)" />
          </>
        )}
        <text
          x="80"
          y="66"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="900"
          fontSize="42"
          fill={isWhite ? "#1A1F71" : "#FFFFFF"}
          textAnchor="middle"
          letterSpacing="8"
        >
          VISA
        </text>
        {isMono && (
          <text
            x="80"
            y="66"
            fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontSize="42"
            fill="currentColor"
            textAnchor="middle"
            letterSpacing="8"
          >
            VISA
          </text>
        )}
      </svg>
    );
  },

  mastercard: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    const red = isWhite || isMono ? 'currentColor' : '#EB001B';
    const orange = isWhite || isMono ? 'currentColor' : '#F79E1B';
    const overlap = isWhite || isMono ? 'currentColor' : '#FF5F00';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="Mastercard" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <circle cx="64" cy="48" r="44" fill={red} opacity={isWhite || isMono ? 1 : 0.9} />
        <circle cx="96" cy="48" r="44" fill={orange} opacity={isWhite || isMono ? 1 : 0.9} />
        <ellipse cx="80" cy="48" rx="28" ry="44" fill={overlap} opacity={isWhite || isMono ? 1 : 0.7} />
        <text
          x="80"
          y="78"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="400"
          fontSize="22"
          fill={isWhite ? "#000000" : "#FFFFFF"}
          textAnchor="middle"
          letterSpacing="1.5"
        >
          mastercard
        </text>
        {isMono && (
          <text
            x="80"
            y="78"
            fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
            fontWeight="400"
            fontSize="22"
            fill="currentColor"
            textAnchor="middle"
            letterSpacing="1.5"
          >
            mastercard
          </text>
        )}
      </svg>
    );
  },

  amex: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    const blue = isWhite || isMono ? 'currentColor' : '#006FCF';
    const textColor = isWhite ? '#006FCF' : '#FFFFFF';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="American Express" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <rect x="0" y="0" width="160" height="96" rx="8" fill={blue} />
        <text
          x="80"
          y="62"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="32"
          fill={textColor}
          textAnchor="middle"
          letterSpacing="2"
        >
          AMEX
        </text>
        {isMono && (
          <text
            x="80"
            y="62"
            fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
            fontWeight="700"
            fontSize="32"
            fill="currentColor"
            textAnchor="middle"
            letterSpacing="2"
          >
            AMEX
          </text>
        )}
      </svg>
    );
  },

  rupay: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    const navy = isWhite || isMono ? 'currentColor' : '#002B5C';
    const red = isWhite || isMono ? 'currentColor' : '#D32F2F';
    const gold = isWhite || isMono ? 'currentColor' : '#FFB300';
    const textColor = isWhite ? '#002B5C' : '#FFFFFF';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="RuPay" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <defs>
          <linearGradient id="rupayBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={navy} />
            <stop offset="100%" stopColor="#001a3a" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="160" height="96" rx="8" fill="url(#rupayBg)" />
        <ellipse cx="80" cy="40" rx="36" ry="28" fill="none" stroke={gold} strokeWidth="2.5" opacity="0.9" />
        <path
          d="M44 40 Q80 12 116 40"
          fill="none"
          stroke={red}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
        <text
          x="80"
          y="78"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="24"
          fill={textColor}
          textAnchor="middle"
          letterSpacing="3"
        >
          RuPay
        </text>
        {isMono && (
          <>
            <ellipse cx="80" cy="40" rx="36" ry="28" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
            <path d="M44 40 Q80 12 116 40" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            <text x="80" y="78" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="24" fill="currentColor" textAnchor="middle" letterSpacing="3">RuPay</text>
          </>
        )}
      </svg>
    );
  },

  discover: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    const orange = isWhite || isMono ? 'currentColor' : '#FF6000';
    const black = isWhite || isMono ? 'currentColor' : '#000000';
    const textColor = isWhite ? '#000000' : '#FFFFFF';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="Discover" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <rect x="0" y="0" width="160" height="96" rx="8" fill={black} />
        <text
          x="80"
          y="62"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="28"
          fill={textColor}
          textAnchor="middle"
          letterSpacing="1"
        >
          DISCOVER
        </text>
        <circle cx="80" cy="68" r="8" fill={orange} />
        {isMono && (
          <>
            <text x="80" y="62" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="28" fill="currentColor" textAnchor="middle" letterSpacing="1">DISCOVER</text>
            <circle cx="80" cy="68" r="8" fill="currentColor" />
          </>
        )}
      </svg>
    );
  },

  unionpay: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    const red = isWhite || isMono ? 'currentColor' : '#D81E2B';
    const textColor = isWhite ? '#D81E2B' : '#FFFFFF';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="UnionPay" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <rect x="0" y="0" width="160" height="96" rx="8" fill={red} />
        <text
          x="80"
          y="62"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="26"
          fill={textColor}
          textAnchor="middle"
          letterSpacing="1.5"
        >
          UnionPay
        </text>
        {isMono && (
          <text x="80" y="62" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="26" fill="currentColor" textAnchor="middle" letterSpacing="1.5">UnionPay</text>
        )}
      </svg>
    );
  },

  jcb: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    const blue = isWhite || isMono ? 'currentColor' : '#0047AB';
    const textColor = isWhite ? '#0047AB' : '#FFFFFF';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="JCB" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <rect x="0" y="0" width="160" height="96" rx="8" fill={blue} />
        <text
          x="80"
          y="62"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="36"
          fill={textColor}
          textAnchor="middle"
          letterSpacing="6"
        >
          JCB
        </text>
        {isMono && (
          <text x="80" y="62" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="36" fill="currentColor" textAnchor="middle" letterSpacing="6">JCB</text>
        )}
      </svg>
    );
  },

  diners: ({ variant = 'color', className = '', width, height }) => {
    const isWhite = variant === 'white';
    const isMono = variant === 'mono';
    const navy = isWhite || isMono ? 'currentColor' : '#001E5E';
    const textColor = isWhite ? '#001E5E' : '#FFFFFF';
    return (
      <svg viewBox="0 0 160 96" role="img" aria-label="Diners Club" className={className} preserveAspectRatio="xMidYMid meet" width={width} height={height}>
        <rect x="0" y="0" width="160" height="96" rx="8" fill={navy} />
        <text
          x="80"
          y="58"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="22"
          fill={textColor}
          textAnchor="middle"
          letterSpacing="1"
        >
          DINERS CLUB
        </text>
        {isMono && (
          <text x="80" y="58" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight="700" fontSize="22" fill="currentColor" textAnchor="middle" letterSpacing="1">DINERS CLUB</text>
        )}
      </svg>
    );
  },
};

export const NetworkLogo: React.FC<NetworkLogoProps> = ({
  network,
  variant = 'color',
  size = 48,
  className = '',
}) => {
  const Component = NETWORK_SVGS[network];
  if (!Component) return null;

  return (
    <Component
      variant={variant}
      className={className}
      width={size}
      height={size}
    />
  );
};

export function getNetworkLogo(network: string): React.ReactElement | null {
  const normalized = network.toLowerCase().replace(/[\s\-_]/g, '') as NetworkType;
  const Component = NETWORK_SVGS[normalized];
  if (!Component) return null;
  return <Component variant="color" />;
}

export function normalizeNetwork(network: string): NetworkType | null {
  const n = network.toLowerCase().replace(/[\s\-_]/g, '');
  const map: Record<string, NetworkType> = {
    visa: 'visa',
    mastercard: 'mastercard',
    mc: 'mastercard',
    amex: 'amex',
    americanexpress: 'amex',
    american_express: 'amex',
    rupay: 'rupay',
    discover: 'discover',
    unionpay: 'unionpay',
    upi: 'unionpay',
    jcb: 'jcb',
    diners: 'diners',
    dinersclub: 'diners',
  };
  return map[n] || null;
}

export default NetworkLogo;