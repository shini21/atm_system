import React from 'react';
import visaLogo from '../../assets/brand/networks/visa.svg';
import mastercardLogo from '../../assets/brand/networks/mastercard.svg';
import amexLogo from '../../assets/brand/networks/amex.svg';
import rupayLogo from '../../assets/brand/networks/rupay.png';

export type NetworkType = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'discover' | 'unionpay' | 'jcb' | 'diners';

interface NetworkLogoProps {
  network: NetworkType;
  variant?: 'color' | 'white' | 'mono';
  size?: number;
  className?: string;
}

const NETWORK_SVGS: Record<Exclude<NetworkType, 'visa' | 'mastercard' | 'amex' | 'rupay'>, React.FC<{ variant?: 'color' | 'white' | 'mono'; className?: string; width?: number; height?: number }>> = {
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

const NETWORK_ASSETS = {
  visa: { src: visaLogo, label: 'Visa' },
  mastercard: { src: mastercardLogo, label: 'Mastercard' },
  amex: { src: amexLogo, label: 'American Express' },
  rupay: { src: rupayLogo, label: 'RuPay' },
};

export const NetworkLogo: React.FC<NetworkLogoProps> = ({
  network,
  variant = 'color',
  size = 48,
  className = '',
}) => {
  if (network in NETWORK_ASSETS) {
    const asset = NETWORK_ASSETS[network as keyof typeof NETWORK_ASSETS];
    return <img src={asset.src} alt={asset.label} width={size} height={size} className={`object-contain ${className}`} />;
  }

  const Component = NETWORK_SVGS[network as keyof typeof NETWORK_SVGS];
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
  const normalized = normalizeNetwork(network);
  return normalized ? <NetworkLogo network={normalized} /> : null;
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