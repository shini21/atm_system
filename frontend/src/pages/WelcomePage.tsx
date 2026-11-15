import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware } from '../context/HardwareContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../utils/sound';
import { api } from '../services/api';
import { DEMO_CARDS } from '../utils/demoCards';
import { ApexCard } from '../components/cards/ApexCard';
import { BrandLogo } from '../components/brand/BrandLogo';
import { CARD_THEMES, CARD_TIERS, DEFAULT_CARD_THEME, type CardThemeId, type CardTier } from '../utils/cardThemes';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, AlertCircle, Unlock, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string>('CARD1001');
  const [manualCardNumber, setManualCardNumber] = useState<string>('CARD1001');
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [unblockSuccess, setUnblockSuccess] = useState<string | null>(null);
  const [cardTheme, setCardTheme] = useState<CardThemeId>(DEFAULT_CARD_THEME);
  const [cardTier, setCardTier] = useState<CardTier | undefined>(undefined);
  const { checkCard, isLoading, error, clearError, clearCard } = useAuth();
  const { setCardSlotState, registerKeypadListener, cardSlotState } = useHardware();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const surface = theme === 'dark' ? 'dark' : 'light';
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
    holder: 'Card not yet read',
    accountType: undefined as string | undefined,
    expiry: undefined as string | undefined,
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

  // Reader status reflects real state only: idle, reading (in flight), rejected (error from server)
  const readerState = isInserting || isLoading ? 'reading' : error ? 'rejected' : cardSlotState === 'ejected' ? 'ejected' : 'waiting';
  const readerLabel = {
    waiting: 'Waiting for card',
    reading: 'Reading card…',
    rejected: 'Card rejected',
    ejected: 'Card ejected',
  }[readerState];
  const readerTone = readerState === 'rejected' ? 'bg-danger' : readerState === 'reading' ? 'bg-warning animate-pulse' : 'bg-success';

  const handleExit = () => {
    if (isInserting || isLoading) return;
    clearError();
    setUnblockSuccess(null);
    clearCard();
    setCardSlotState('empty');
    setSelectedCardId('CARD1001');
    setManualCardNumber('CARD1001');
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 lg:gap-10 items-start py-1">
      {/* LEFT — brand, welcome copy, card preview */}
      <section aria-labelledby="welcome-heading" className="flex flex-col items-center lg:items-start text-center lg:text-left">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center lg:items-start">
          <BrandLogo variant="horizontal" surface={surface} className="w-44 sm:w-52 h-[3.6rem] sm:h-[4.2rem]" />
          <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.18em] text-tertiary inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            Terminal X-9000 · {t('app.location')} · Simulated
          </p>
          <h1 id="welcome-heading" className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-primary leading-[1.1]">
            Welcome to Apex Bank
          </h1>
          <p className="mt-3 text-sm sm:text-base text-secondary max-w-md">
            Insert your debit card or choose a demo profile to begin. Every account and card here is fictional.
          </p>
        </motion.div>

        <div className="mt-6 w-full flex flex-col items-center lg:items-start">
          <ApexCard
            cardNumber={currentDemo.cardNumber}
            cardHolderName={currentDemo.holder}
            expiryDate={currentDemo.expiry}
            accountType={currentDemo.accountType}
            isBlocked={currentDemo.status === 'blocked'}
            isExpired={currentDemo.status === 'expired'}
            isInserting={isInserting}
            theme={cardTheme}
            tier={cardTier}
          />

          {/* Presentation controls: Design (theme) and Tier are independent */}
          <div className="mt-4 w-full max-w-[420px] space-y-3 text-left">
            <fieldset>
              <legend className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">Card design</legend>
              <div className="flex flex-wrap gap-1.5">
                {CARD_THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    aria-pressed={cardTheme === th.id}
                    onClick={() => setCardTheme(th.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 min-h-[32px] rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                      cardTheme === th.id ? 'bg-accent text-on-accent border-accent' : 'bg-surface text-secondary border-border-subtle hover:bg-surface-hover'
                    }`}
                  >
                    <span aria-hidden="true" className="w-3 h-3 rounded-full border border-black/20" style={{ background: th.face }} />
                    {th.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                Tier preview <span className="normal-case font-normal text-tertiary">(presentation only — not in the account model)</span>
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {[{ id: undefined, label: 'None' }, ...CARD_TIERS].map((tr) => (
                  <button
                    key={tr.label}
                    type="button"
                    aria-pressed={cardTier === tr.id}
                    onClick={() => setCardTier(tr.id as CardTier | undefined)}
                    className={`px-2.5 min-h-[32px] rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                      cardTier === tr.id ? 'bg-accent text-on-accent border-accent' : 'bg-surface text-secondary border-border-subtle hover:bg-surface-hover'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </section>

      {/* RIGHT — reader status, alerts, profiles, actions */}
      <section aria-label="Card insertion" className="w-full min-w-0">
        <div role="status" aria-live="polite" className="flex items-center gap-2 mb-4 px-3 py-2 rounded-control bg-surface border border-border-subtle text-xs">
          <span className={`w-2 h-2 rounded-full ${readerTone}`} aria-hidden="true" />
          <span className="font-semibold text-primary whitespace-nowrap">Card reader</span>
          <span className="text-secondary whitespace-nowrap">· {readerLabel}</span>
          <span className="ml-auto hidden sm:inline text-[10px] uppercase tracking-wider text-tertiary whitespace-nowrap">Simulated hardware</span>
        </div>

        <AnimatePresence>
          {unblockSuccess && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="w-full mb-4 p-3 rounded-control bg-success-subtle border border-success/30 text-success text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" /><span>{unblockSuccess}</span></div>
              <Button variant="primary" size="sm" onClick={() => handleInsert(selectedCardId)} className="flex-shrink-0">Insert now</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
              className="w-full mb-4 p-3 rounded-control bg-danger-subtle border border-danger/30 text-danger text-xs flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1"><p className="font-semibold">Card notice</p><p className="mt-0.5">{error}</p></div>
              </div>
              {error.toLowerCase().includes('blocked') && (
                <div className="pt-2 border-t border-danger/20 flex justify-end">
                  <button type="button" onClick={() => handleUnblockCard(manualCardNumber)}
                    className="inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-control bg-surface text-primary border border-border-subtle hover:bg-surface-hover text-xs font-medium cursor-pointer">
                    <Unlock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span>Unblock card (demo action)</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-2 px-0.5">
          <h2 className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Classroom Demo Profiles</h2>
          <span className="text-[10px] text-tertiary font-mono">[1 – 4] quick select</span>
        </div>

        <div role="group" aria-label="Demo profiles" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_CARDS.map((card, idx) => {
            const isSelected = selectedCardId === card.cardNumber;
            const statusVariant = card.status === 'blocked' ? 'error' : card.status === 'expired' ? 'warning' : 'success';
            return (
              <button
                key={card.cardNumber}
                type="button"
                aria-pressed={isSelected}
                disabled={isInserting || isLoading}
                onClick={() => handleSelectDemo(card.cardNumber)}
                className={`relative p-3 rounded-card border text-left transition-all cursor-pointer disabled:opacity-60 ${
                  isSelected ? 'bg-surface border-accent shadow-md ring-2 ring-accent/25' : 'bg-surface hover:bg-surface-hover border-border-subtle'
                }`}
              >
                {isSelected && <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-accent" />}
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="font-mono text-xs font-semibold text-primary">{card.cardNumber}</span>
                  <Badge variant={statusVariant} size="sm" dot>{card.status}</Badge>
                </div>
                <div className="text-sm text-primary font-medium truncate">{card.holder}</div>
                <div className="text-[11px] text-tertiary truncate">{card.accountType}</div>
                <span className="absolute bottom-2 right-2.5 text-[10px] font-mono text-tertiary" aria-hidden="true">#{idx + 1}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label htmlFor="card-number-input" className="block text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1.5">Card identifier</label>
          <input
            id="card-number-input"
            type="text"
            value={manualCardNumber}
            disabled={isInserting || isLoading}
            onChange={(e) => { const val = e.target.value.toUpperCase(); setManualCardNumber(val); setSelectedCardId(val); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleInsert(manualCardNumber); }}
            placeholder="e.g. CARD1001"
            maxLength={12}
            autoComplete="off"
            className="w-full px-3.5 min-h-[44px] rounded-control bg-surface border border-border-strong focus:border-accent text-primary font-mono text-sm tracking-wider uppercase placeholder:text-tertiary outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2.5">
          <Button variant="outline" size="lg" onClick={handleExit} disabled={isInserting || isLoading} icon={<LogOut className="w-4 h-4" />} className="sm:w-auto min-h-[48px]">
            Exit
          </Button>
          <Button variant="primary" size="lg" isLoading={isLoading || isInserting} onClick={() => handleInsert(manualCardNumber)} icon={<ArrowRight className="w-4 h-4" />} className="flex-1 min-h-[48px]">
            Insert Card
          </Button>
        </div>

        {/* Selected profile — only fields that exist on the card record */}
        <div className="mt-6 pt-5 border-t border-border-subtle">
          <h2 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">Selected card</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm" aria-live="polite">
            <div><dt className="text-[11px] text-tertiary">Cardholder</dt><dd className="font-medium text-primary truncate">{currentDemo.holder}</dd></div>
            <div><dt className="text-[11px] text-tertiary">Account type</dt><dd className="font-medium text-primary">{currentDemo.accountType ?? '—'}</dd></div>
            <div><dt className="text-[11px] text-tertiary">Card identifier</dt><dd className="font-mono text-primary">{currentDemo.cardNumber}</dd></div>
            <div><dt className="text-[11px] text-tertiary">Card status</dt><dd className="font-medium text-primary capitalize">{currentDemo.status}</dd></div>
          </dl>
          <p className="mt-4 text-[11px] text-tertiary">
            Insertion is simulated. The card is validated by the Apex Bank backend before you are asked for a PIN.
          </p>
        </div>
      </section>
    </div>
  );
};
