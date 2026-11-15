import React from 'react';
import { motion } from 'motion/react';
import { useHardware } from '../../context/HardwareContext';
import { useAuth } from '../../context/AuthContext';
import { CreditCard } from 'lucide-react';
import { lastFour } from '../../utils/cardThemes';

/** Card reader bay. Every indicator below is driven by HardwareContext.cardSlotState. */
export const CardSlot: React.FC = () => {
  const { cardSlotState } = useHardware();
  const { session, cardStatus } = useAuth();

  const states = {
    empty: { text: 'Ready', led: 'bg-success' },
    inserted: { text: 'Card held', led: 'bg-accent' },
    reading: { text: 'Reading', led: 'bg-warning animate-pulse' },
    blocked: { text: 'Rejected', led: 'bg-danger' },
    ejected: { text: 'Take card', led: 'bg-warning animate-pulse' },
  } as const;
  const st = states[cardSlotState] ?? states.empty;
  const heldId = cardStatus?.cardNumber || session?.cardNumber;
  const showCard = cardSlotState === 'inserted' || session?.authenticated;

  return (
    <div className="flex flex-col items-center w-full" role="group" aria-label="Card reader (simulated)">
      <div className="flex items-center justify-between w-full max-w-[240px] mb-1.5 px-0.5">
        <span className="text-[10px] font-semibold tracking-[0.14em] text-secondary uppercase flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
          Card reader
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-secondary" role="status">
          <span className={`w-2 h-2 rounded-full ${st.led}`} aria-hidden="true" />
          {st.text}
        </span>
      </div>

      {/* Machined bezel + slot */}
      <div className="relative w-full max-w-[240px] h-14 rounded-lg overflow-hidden flex items-center justify-center px-3"
        style={{ background: 'linear-gradient(180deg,#D8E0E8,#C8D4E0)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.75), inset 0 -1px 0 rgba(23,43,69,.18), 0 1px 2px rgba(0,0,0,.2)' }}>
        <div className="relative w-full h-3 rounded-full flex items-center justify-center"
          style={{ background: '#172B45', boxShadow: 'inset 0 2px 4px rgba(0,0,0,.95), 0 1px 0 rgba(255,255,255,.55)' }}>
          <div className={`h-[2px] w-24 rounded-full ${cardSlotState === 'blocked' ? 'bg-danger' : cardSlotState === 'inserted' ? 'bg-accent' : 'bg-success/80'}`} />
        </div>
        {showCard && (
          <motion.div
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute bottom-0 w-32 h-6 rounded-t-md flex items-center justify-between px-2 text-[9px] font-mono select-none"
            style={{ background: 'linear-gradient(145deg,#26282D,#0C0C0E)', color: '#F3F6FA', borderTop: '1px solid #4D9FE0' }}
          >
            <span aria-hidden="true" className="w-3 h-2 rounded-[2px]" style={{ background: 'linear-gradient(135deg,#F1DFB0,#B8964F)' }} />
            <span className="tracking-wider">•••• {heldId ? lastFour(heldId) : ''}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
