import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';

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
    <div className="min-h-screen bg-canvas text-primary flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-accent selection:text-white transition-colors duration-200">
      {/* Minimal Luxury Terminal Frame */}
      <div className="w-full max-w-4xl rounded-3xl bg-surface border border-border-subtle shadow-luxury p-4 sm:p-8 transition-all duration-200 relative">
        
        {/* Refined Header */}
        <header className="flex items-center justify-between pb-4 sm:pb-5 mb-5 sm:mb-6 border-b border-border-subtle">
          {/* Brand & Optional Back Button */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-primary bg-surface-subdued hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-surface flex items-center justify-center font-semibold text-xs tracking-tight shadow-sm select-none">
                  AP
                </div>
                <div>
                  <div className="font-semibold text-sm tracking-tight text-primary">APEX</div>
                  <div className="text-[11px] text-tertiary">Touch Banking</div>
                </div>
              </div>
            )}
          </div>

          {/* Active Title */}
          {activeScreenTitle && (
            <div className="hidden sm:block text-xs font-medium text-secondary tracking-wide uppercase">
              {activeScreenTitle}
            </div>
          )}

          {/* Controls: Time + Theme Toggle + Eject */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xs font-mono text-tertiary hidden sm:inline-block">
              {timeStr}
            </span>

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Eject / Exit Button */}
            {(session?.authenticated || cardStatus) && (
              <button
                type="button"
                onClick={handleEject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-danger bg-surface-subdued hover:bg-danger-subtle border border-border-subtle hover:border-danger/20 transition-all cursor-pointer select-none"
                title="Eject card and exit session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Eject</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Screen Content */}
        <main className="min-h-[460px] flex flex-col justify-between">
          {children}
        </main>
      </div>

      {/* Subtle Minimal Footer Attribution */}
      <footer className="mt-4 text-[11px] text-tertiary text-center tracking-normal">
        Apex Banking System • End-to-End Encrypted Session
      </footer>
    </div>
  );
};
