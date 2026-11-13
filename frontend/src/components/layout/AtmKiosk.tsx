import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHardware } from '../../context/HardwareContext';
import { LogOut, ArrowLeft, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';
import { SoundToggle } from '../ui/SoundToggle';
import { HardwareConsole } from '../atm/HardwareConsole';
import { motion, AnimatePresence } from 'motion/react';

interface AtmKioskProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const AtmKiosk: React.FC<AtmKioskProps> = ({
  children,
  activeScreenTitle,
  showBack = false,
  onBack,
}) => {
  const { session, cardStatus, clearCard } = useAuth();
  const { t } = useLanguage();
  const { inactivitySeconds, isExpiringSoon, resetInactivity } = useHardware();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEject = async () => {
    if (session?.authenticated) {
      navigate('/eject');
    } else {
      clearCard();
      navigate('/');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 selection:bg-accent selection:text-white transition-colors duration-200">
      {/* Outer Kiosk Machine Enclosure */}
      <div className="w-full max-w-5xl rounded-3xl bg-surface/90 border border-border-subtle shadow-luxury p-3 sm:p-6 transition-all duration-200 relative">
        
        {/* Terminal Canopy Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 sm:pb-4 mb-4 border-b border-border-subtle gap-2">
          {/* Left: Brand + Terminal Model & Location */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-primary bg-surface-subdued hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('app.back')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-surface flex items-center justify-center font-bold text-xs tracking-tight shadow-sm select-none">
                  AP
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
                    <span>{t('app.brand')}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subdued text-secondary font-normal border border-border-subtle">
                      X-9000
                    </span>
                  </div>
                  <div className="text-[11px] text-tertiary flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>{t('app.location')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center: Active Screen Title */}
          {activeScreenTitle && (
            <div className="hidden md:block text-xs font-semibold text-secondary tracking-widest uppercase">
              {activeScreenTitle}
            </div>
          )}

          {/* Right: Controls (Sound + Lang + Theme + Eject + Time) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-tertiary">
              <Clock className="w-3 h-3" />
              <span>{timeStr}</span>
            </div>

            {/* Audio Toggle */}
            <SoundToggle />

            {/* Language Toggle (English / हिन्दी) */}
            <LanguageToggle />

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Eject / Exit Button */}
            {(session?.authenticated || cardStatus) && (
              <button
                type="button"
                onClick={handleEject}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-danger bg-surface-subdued hover:bg-danger-subtle border border-border-subtle hover:border-danger/20 transition-all cursor-pointer select-none"
                title="Eject card and exit session"
              >
                <LogOut className="w-3.5 h-3.5 text-danger" />
                <span className="hidden xs:inline">{t('app.eject')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Inactivity Warning Banner (if session expiring soon) */}
        <AnimatePresence>
          {session?.authenticated && isExpiringSoon && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="w-full px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>
                    {t('app.sessionExpiring')}{' '}
                    <strong className="font-mono text-sm">{inactivitySeconds}</strong>{' '}
                    {t('app.seconds')}.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetInactivity}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-medium text-[11px] hover:bg-amber-600 cursor-pointer"
                >
                  Stay Logged In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Touchscreen Inset Display Surround */}
        <div className="rounded-2xl bg-surface border border-border-subtle shadow-inner p-4 sm:p-6 min-h-[440px] flex flex-col justify-between relative overflow-hidden">
          <main className="w-full flex flex-col justify-between min-h-[400px]">
            {children}
          </main>
        </div>

        {/* Hardware Bay (Card Slot, Note Dispenser with Animated Bills, Receipt Printer, Keypad) */}
        <HardwareConsole />
      </div>

      {/* Subtle Terminal Footer Attribution */}
      <footer className="mt-3 text-[11px] text-tertiary text-center tracking-normal">
        Apex Touch Banking • PCI-PTS Certified Terminal • End-to-End Hardware Encryption
      </footer>
    </div>
  );
};
