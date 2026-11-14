import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, Clock, ShieldCheck, LogOut, Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';
import { SoundToggle } from '../ui/SoundToggle';

export interface HeaderProps {
  activeScreenTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreenTitle,
  showBack = false,
  onBack,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  isSidebarCollapsed = false,
  onToggleSidebar,
  showSidebarToggle = false,
}) => {
  const { session, cardStatus, clearCard } = useAuth();
  const { t } = useLanguage();
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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogoClick = () => {
    if (session?.authenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleEject = () => {
    if (session?.authenticated) {
      navigate('/eject');
    } else {
      clearCard();
      navigate('/');
    }
  };

  return (
    <header className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-border-subtle gap-2 w-full">
      {/* Left: Sidebar Toggle, Back Button & Brand Monogram */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {showSidebarToggle && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-surface-subdued hover:bg-surface-hover border border-border-subtle text-secondary hover:text-primary transition-colors cursor-pointer select-none"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label={t('app.back') || 'Go Back'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-primary bg-surface-subdued hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer select-none flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t('app.back')}</span>
          </button>
        )}

        {/* Clickable Brand Monogram & Terminal Designation */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded-xl p-1 -m-1 transition-all select-none"
          title="Return to Main ATM Terminal Screen"
          aria-label="Apex ATM Home"
        >
          <div className="w-8 h-8 rounded-xl bg-primary text-surface flex items-center justify-center font-bold text-xs tracking-tight shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            AP
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm tracking-tight text-primary flex items-center gap-1.5">
              <span className="group-hover:text-accent transition-colors">{t('app.brand')}</span>
              <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subdued text-secondary font-normal border border-border-subtle">
                X-9000
              </span>
            </div>
            <div className="text-[11px] text-tertiary flex items-center gap-1 truncate">
              <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{t('app.location')}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Center: Active Screen Title (Desktop & Tablet) */}
      {activeScreenTitle && (
        <div className="hidden md:block text-xs font-semibold text-secondary tracking-widest uppercase truncate max-w-[240px]">
          {activeScreenTitle}
        </div>
      )}

      {/* Right: Controls + Live Clock + Mobile Hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Live Clock (Large screens) */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-tertiary mr-1">
          <Clock className="w-3 h-3" />
          <span>{timeStr}</span>
        </div>

        {/* Desktop Quick Toggles */}
        <div className="hidden sm:flex items-center gap-1.5">
          <SoundToggle />
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Eject / Exit Button */}
        {(session?.authenticated || cardStatus) && (
          <button
            type="button"
            onClick={handleEject}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-danger bg-surface-subdued hover:bg-danger-subtle border border-border-subtle hover:border-danger/20 transition-all cursor-pointer select-none flex-shrink-0"
            title="Eject card and exit session"
            aria-label="Eject card"
          >
            <LogOut className="w-3.5 h-3.5 text-danger" />
            <span className="hidden md:inline">{t('app.eject')}</span>
          </button>
        )}

        {/* Mobile Hamburger Menu Button (Visible on screens < md) */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl bg-surface-subdued hover:bg-surface-hover border border-border-subtle text-primary transition-colors cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-accent" />
            ) : (
              <Menu className="w-4 h-4 text-primary" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};

