import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Clock, RotateCw } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { NetworkLogo, normalizeNetwork } from '../brand/NetworkLogo';
import {
  CARD_TIERS,
  type CardThemeId,
  type CardTier,
  DEFAULT_CARD_THEME,
  formatExpiry,
  getCardTheme,
  lastFour,
} from '../../utils/cardThemes';

export interface ApexCardProps {
  /** Card identifier from the card model (e.g. CARD1001). Only the last four digits are rendered. */
  cardNumber: string;
  cardHolderName?: string;
  /** ISO date or MM/YY from the card model */
  expiryDate?: string;
  accountType?: string;
  isBlocked?: boolean;
  isExpired?: boolean;
  isInserting?: boolean;
  /** Visual theme – presentation only */
  theme?: CardThemeId;
  /** Banking tier – identity. Omitted when the model has none. */
  tier?: CardTier;
  /** Payment network from the card model. When absent a labelled placeholder is shown. */
  network?: string;
  /** Show the flip control (default true) */
  flippable?: boolean;
  className?: string;
}

/** Contactless indicator (four arcs) – drawn as plain SVG, not a brand asset. */
const Contactless: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" style={{ width: '5.2cqw', height: '5.2cqw' }}>
    <path d="M8.5 8.5a5 5 0 0 1 0 7" />
    <path d="M12 6a8.5 8.5 0 0 1 0 12" />
    <path d="M15.5 3.5a12 12 0 0 1 0 17" />
  </svg>
);

/** EMV chip: contact pads on a metallic plate. */
const EmvChip: React.FC<{ gradient: string }> = ({ gradient }) => (
  <div
    aria-hidden="true"
    style={{
      width: '13cqw', height: '10cqw', borderRadius: '1.6cqw', background: gradient,
      boxShadow: 'inset 0 0 0 0.3cqw rgba(0,0,0,0.28), inset 0 0.4cqw 0.4cqw rgba(255,255,255,0.45)',
      position: 'relative', overflow: 'hidden',
    }}
  >
    <svg viewBox="0 0 52 40" width="100%" height="100%" fill="none" stroke="rgba(40,30,10,0.5)" strokeWidth="1">
      <path d="M0 13h14a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H0M52 13H38a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h14M18 20h16M26 0v13M26 27v13" />
    </svg>
  </div>
);

export const ApexCard: React.FC<ApexCardProps> = ({
  cardNumber,
  cardHolderName = 'CARDHOLDER',
  expiryDate,
  accountType,
  isBlocked = false,
  isExpired = false,
  isInserting = false,
  theme = DEFAULT_CARD_THEME,
  tier,
  network,
  flippable = true,
  className = '',
}) => {
  const t = getCardTheme(theme);
  const [flipped, setFlipped] = useState(false);
  const last4 = lastFour(cardNumber);
  const tierLabel = tier ? CARD_TIERS.find((x) => x.id === tier)?.label : undefined;
  const status = isBlocked ? 'Blocked' : isExpired ? 'Expired' : 'Active';
  const StatusIcon = isBlocked ? ShieldAlert : isExpired ? Clock : ShieldCheck;

  const faceBase: React.CSSProperties = {
    position: 'absolute', inset: 0, borderRadius: '4.2cqw', overflow: 'hidden',
    background: t.face, color: t.ink,
    boxShadow: `inset 0 0 0 0.25cqw ${t.light ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.1)'}, inset 0 0 0 0.5cqw rgba(0,0,0,${t.light ? 0.06 : 0.35})`,
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
  };
  // Surface texture + diagonal sheen share one overlay so they never intercept pointer events
  const texture: React.CSSProperties = {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${t.light ? 0.5 : 0.1}) 46%, rgba(255,255,255,0) 60%), repeating-linear-gradient(45deg, rgba(255,255,255,${t.light ? 0.0 : 0.018}) 0 1px, transparent 1px 3px)`,
  };

  return (
    <div className={`w-full max-w-[420px] ${className}`}>
      {/* Container-query box: every internal size is expressed in cqw so the card scales as a unit */}
      <div
        data-testid="apex-card"
        data-theme={t.id}
        data-tier={tier ?? 'none'}
        style={{
          containerType: 'inline-size', aspectRatio: '85.6 / 53.98', width: '100%',
          perspective: '1400px', position: 'relative',
          transform: isInserting ? 'translateY(-6%) scale(0.94)' : undefined,
          opacity: isInserting ? 0.4 : 1,
          transition: 'transform 600ms cubic-bezier(.32,.72,0,1), opacity 600ms',
          filter: 'drop-shadow(0 14px 22px rgba(17,18,20,0.28))',
        }}
        className="motion-reduce:!transition-none"
      >
        <div
          style={{
            position: 'absolute', inset: 0, transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 650ms cubic-bezier(.4,.1,.2,1)',
          }}
          className="motion-reduce:!transition-none"
        >
          {/* FRONT */}
          <div style={faceBase} aria-hidden={flipped} data-face="front">
            <div style={texture} />
            <div style={{ position: 'absolute', inset: '6cqw 6cqw 5.5cqw 6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.2cqw' }}>
                  <BrandLogo variant="monogram" mono={t.mono} decorative className="w-[9.5cqw] h-[9.5cqw] shrink-0" />
                  <div style={{ lineHeight: 1.1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, letterSpacing: '0.5cqw', fontSize: '5.6cqw' }}>APEX</div>
                    <div style={{ fontWeight: 500, letterSpacing: '0.9cqw', fontSize: '2.2cqw', color: t.inkMuted }}>
                      {tierLabel ? tierLabel.toUpperCase() : 'BANK'}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.9cqw', fontSize: '2.6cqw', fontWeight: 600,
                    padding: '0.8cqw 2cqw', borderRadius: '999px',
                    background: t.light ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.38)', color: t.ink,
                    boxShadow: `inset 0 0 0 0.25cqw ${t.inkMuted}`,
                  }}
                >
                  <StatusIcon style={{ width: '3cqw', height: '3cqw' }} aria-hidden="true" />
                  {status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '3cqw' }}>
                <EmvChip gradient={t.chip} />
                <Contactless color={t.inkMuted} />
              </div>

              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '5.6cqw', letterSpacing: '0.55cqw', fontWeight: 500, marginBottom: '2cqw' }}>
                  <span aria-label={`Card ending ${last4}`}>•••• •••• •••• {last4}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '3cqw' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '2cqw', letterSpacing: '0.4cqw', color: t.inkMuted }}>CARDHOLDER</div>
                    <div style={{ fontSize: '3.4cqw', fontWeight: 600, letterSpacing: '0.35cqw', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cardHolderName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '2cqw', letterSpacing: '0.4cqw', color: t.inkMuted }}>VALID THRU</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '3.4cqw', fontWeight: 500 }}>{formatExpiry(expiryDate)}</div>
                  </div>
                  <div
                    data-testid="card-network"
                    title={network ? undefined : 'Payment network is not part of the card model yet'}
                    style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32cqw', height: '16cqw', borderRadius: '1.5cqw',
                      background: network ? 'transparent' : `repeating-linear-gradient(45deg, ${t.inkMuted} 0 0.5cqw, transparent 0.5cqw 2cqw)`,
                    }}
                  >
                    {network ? (
                      <NetworkLogo
                        network={normalizeNetwork(network) || 'visa'}
                        variant={t.light ? 'color' : 'white'}
                        size={28}
                      />
                    ) : (
                      <>
                        <span style={{ fontSize: '1.6cqw', fontWeight: 600, color: t.inkMuted, letterSpacing: '0.2cqw' }}>DEBIT</span>
                        <span style={{ fontSize: '1.4cqw', color: t.inkMuted, marginLeft: '1cqw' }}>N/A</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACK – never shows a full number or CVV */}
          <div style={{ ...faceBase, transform: 'rotateY(180deg)' }} aria-hidden={!flipped} data-face="back">
            <div style={texture} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '8cqw', height: '11cqw', background: 'linear-gradient(#050506,#1a1a1d)' }} />
            <div style={{ position: 'absolute', left: '6cqw', right: '6cqw', top: '25cqw' }}>
              <div style={{ height: '9cqw', borderRadius: '1cqw', background: 'repeating-linear-gradient(0deg,#F3F6FA 0 1.2cqw,#E6EBF1 1.2cqw 2.4cqw)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2.5cqw', color: '#697586', fontSize: '2.6cqw', fontStyle: 'italic' }}>
                Authorised signature
              </div>
              <div style={{ marginTop: '4cqw', fontSize: '2.8cqw', color: t.inkMuted, lineHeight: 1.5 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: t.ink, fontSize: '3.4cqw' }}>Card ending {last4}</div>
                {accountType && <div>{accountType}</div>}
                <div>Academic banking simulation · No real funds or card data.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {flippable && (
        <div className="mt-2.5 flex justify-center">
          <button
            type="button"
            aria-pressed={flipped}
            onClick={() => setFlipped((f) => !f)}
            className="inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-full text-xs font-medium text-secondary hover:text-primary bg-surface-subdued border border-border-subtle hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            {flipped ? 'Show card front' : 'Show card back'}
          </button>
        </div>
      )}
    </div>
  );
};
