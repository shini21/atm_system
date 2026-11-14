import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware } from '../context/HardwareContext';
import { sound } from '../utils/sound';
import { api } from '../services/api';
import { DEMO_CARDS } from '../utils/demoCards';
import { TiltedATMCard } from '../components/cards/TiltedATMCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, AlertCircle, CreditCard, Unlock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string>('CARD1001');
  const [manualCardNumber, setManualCardNumber] = useState<string>('CARD1001');
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [unblockSuccess, setUnblockSuccess] = useState<string | null>(null);
  const { checkCard, isLoading, error, clearError } = useAuth();
  const { setCardSlotState, registerKeypadListener } = useHardware();
  const navigate = useNavigate();

  // Listen to physical keypad / laptop numpad events (1-4 to select demo card, Enter to insert)
  useEffect(() => {
    const unsubscribe = registerKeypadListener((key) => {
      if (isInserting || isLoading) return;
      if (key === 'ENTER') {
        handleInsert(manualCardNumber || selectedCardId);
      } else if (key === '1') {
        handleSelectDemo('CARD1001');
      } else if (key === '2') {
        handleSelectDemo('CARD1002');
      } else if (key === '3') {
        handleSelectDemo('CARD1003');
      } else if (key === '4') {
        handleSelectDemo('CARD1004');
      }
    });
    return unsubscribe;
  }, [registerKeypadListener, isInserting, isLoading, manualCardNumber, selectedCardId]);

  // Selected demo profile metadata
  const currentDemo = DEMO_CARDS.find((c) => c.cardNumber === selectedCardId) || {
    cardNumber: manualCardNumber || 'CARD1001',
    holder: 'VALUED CARDHOLDER',
    accountType: 'Savings Account',
    expiry: '12/28',
    status: 'active' as const,
  };

  const handleSelectDemo = (cardNum: string) => {
    if (isInserting || isLoading) return;
    sound.playKeyClick();
    clearError();
    setUnblockSuccess(null);
    setSelectedCardId(cardNum);
    setManualCardNumber(cardNum);
  };

  const handleInsert = async (cardNumToInsert: string) => {
    if (isInserting || isLoading) return;
    clearError();
    setUnblockSuccess(null);
    const cleanNum = cardNumToInsert.trim().toUpperCase();
    if (!cleanNum) return;

    setIsInserting(true);
    setCardSlotState('reading');
    sound.playCardInsert();

    // Mechanical insertion sequence timing: 650ms smooth intake animation
    setTimeout(async () => {
      const success = await checkCard(cleanNum);
      setIsInserting(false);
      if (success) {
        setCardSlotState('inserted');
        navigate('/pin');
      } else {
        setCardSlotState('blocked');
        sound.playAlert();
      }
    }, 650);
  };

  const handleUnblockCard = async (cardNum: string) => {
    try {
      await api.unblockCard(cardNum);
      sound.playSuccess();
      setUnblockSuccess(`Card ${cardNum} has been unblocked. You may now insert it.`);
      clearError();
    } catch {
      sound.playAlert();
      setUnblockSuccess(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 sm:py-4 w-full">
      {/* Centered Glassmorphic Authentication Card per Style Guide §10.1 */}
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-surface/90 dark:bg-surface/80 backdrop-blur-md border border-border-subtle p-5 sm:p-7 shadow-luxury transition-all">
        {/* Brand Monogram & Welcome Typography */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-6"
        >
          {/* Brand Emblem */}
          <div className="inline-flex items-center justify-center mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-champagne/25 to-champagne/5 dark:from-champagne/30 dark:to-champagne/10 border border-champagne/40 flex items-center justify-center shadow-xs">
              <span className="font-bold text-lg text-champagne tracking-tighter">A</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              APEX Touch Banking
            </span>
            <span className="w-1 h-1 rounded-full bg-border-strong" />
            <span className="inline-flex items-center gap-1 text-[11px] text-tertiary">
              <ShieldCheck className="w-3 h-3 text-accent" />
              Terminal 042
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary">
            Welcome to Apex
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-secondary">
            Insert your debit card or select a demo profile below to begin.
          </p>
        </motion.div>

        {/* Success Alert for Unblock */}
        <AnimatePresence>
          {unblockSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="w-full mb-5 p-3.5 rounded-2xl bg-success-subtle border border-success/30 text-success text-xs flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{unblockSuccess}</span>
              </div>
              <Button
                variant="champagne"
                size="sm"
                onClick={() => handleInsert(selectedCardId)}
                className="ml-2 text-[10px] py-1 px-2.5 flex-shrink-0"
              >
                Insert Now
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert Box with Optional Unblock Trigger */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full mb-5 p-3.5 rounded-2xl bg-danger-subtle border border-danger/30 text-danger text-xs flex flex-col gap-2.5 shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-danger">Card Notice</p>
                  <p className="opacity-95 mt-0.5 text-xs">{error}</p>
                </div>
              </div>
              {error.toLowerCase().includes('blocked') && (
                <div className="pt-2 border-t border-danger/20 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleUnblockCard(manualCardNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface text-primary border border-border-subtle hover:bg-surface-hover hover:border-accent text-xs font-medium transition-all cursor-pointer shadow-xs"
                  >
                    <Unlock className="w-3.5 h-3.5 text-accent" />
                    <span>Unblock Card (Demo Action)</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Reader Slot Bezel & 3D Interactive Debit Card */}
        <div className="flex flex-col items-center mb-6 relative w-full">
          {/* Card Reader Slot Bezel */}
          <div className="w-full max-w-[270px] xs:max-w-[290px] sm:max-w-xs h-3.5 bg-surface-subdued rounded-full border border-border-strong mb-5 flex items-center justify-between px-3 shadow-inner relative">
            <div className="w-3/4 h-1 bg-border-strong rounded-full opacity-60 mx-auto" />
            {/* Status LED Indicator */}
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isInserting
                  ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                  : currentDemo.status === 'blocked'
                  ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                  : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
              }`}
              title={
                isInserting
                  ? 'Reading Card...'
                  : currentDemo.status === 'blocked'
                  ? 'Card Blocked'
                  : 'Slot Ready'
              }
            />
          </div>

          {/* 3D Interactive Tilted Debit Card */}
          <TiltedATMCard
            cardNumber={currentDemo.cardNumber}
            cardHolderName={currentDemo.holder}
            expiryDate={currentDemo.expiry}
            accountType={currentDemo.accountType}
            isBlocked={currentDemo.status === 'blocked'}
            isExpired={currentDemo.status === 'expired'}
            isInserting={isInserting}
            onClick={() => handleInsert(currentDemo.cardNumber)}
          />
        </div>

        {/* Card Number Input & Insertion Action */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="w-full mb-6"
        >
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualCardNumber}
                disabled={isInserting || isLoading}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setManualCardNumber(val);
                  setSelectedCardId(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInsert(manualCardNumber);
                }}
                placeholder="e.g. CARD1001"
                maxLength={12}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subdued border border-border-subtle focus:border-accent focus:bg-surface text-primary font-mono text-sm tracking-wider uppercase placeholder:text-tertiary transition-all outline-none"
              />
              <CreditCard className="absolute right-3.5 top-3 w-4 h-4 text-tertiary pointer-events-none" />
            </div>

            <Button
              variant="primary"
              size="md"
              isLoading={isLoading || isInserting}
              onClick={() => handleInsert(manualCardNumber)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Insert Card
            </Button>
          </div>
        </motion.div>

        {/* Classroom Demo Profiles Selector */}
        <div className="w-full pt-5 border-t border-border-subtle">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
              Classroom Demo Profiles
            </span>
            <span className="text-[10px] text-tertiary font-mono">
              [1 - 4] Quick Select
            </span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
            {DEMO_CARDS.map((card, idx) => {
              const isSelected = selectedCardId === card.cardNumber;
              const statusVariant =
                card.status === 'blocked'
                  ? 'error'
                  : card.status === 'expired'
                  ? 'warning'
                  : 'success';

              return (
                <motion.button
                  key={card.cardNumber}
                  type="button"
                  disabled={isInserting || isLoading}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDemo(card.cardNumber)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-surface border-champagne shadow-sm ring-1 ring-champagne/50'
                      : 'bg-surface-subdued hover:bg-surface-hover border-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface border border-border-subtle text-tertiary">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        {card.cardNumber}
                      </span>
                    </div>
                    <Badge variant={statusVariant} size="sm">
                      {card.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-secondary font-medium truncate">
                    {card.holder}
                  </div>
                  <div className="text-[10px] text-tertiary truncate">
                    {card.accountType.replace(' Account', '')}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
