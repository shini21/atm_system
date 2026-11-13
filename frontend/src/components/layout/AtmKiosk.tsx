import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHardware } from '../../context/HardwareContext';
import {
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Menu,
  X,
  Home,
  LayoutDashboard,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  KeyRound,
  HelpCircle,
  Phone,
  Mail,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';
import { SoundToggle } from '../ui/SoundToggle';
import { HardwareConsole } from '../atm/HardwareConsole';
import { SideFunctionKeys } from '../atm/SideFunctionKeys';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
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
  const { session, cardStatus, account, clearCard } = useAuth();
  const { t } = useLanguage();
  const { inactivitySeconds, isExpiringSoon, resetInactivity } = useHardware();
  const navigate = useNavigate();
  const location = useLocation();

  const [timeStr, setTimeStr] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // Live Terminal Clock
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

  // Close mobile navigation drawer whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Keyboard accessibility: Escape closes mobile drawer and modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isHelpModalOpen) setIsHelpModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isHelpModalOpen]);

  const handleEject = async () => {
    setIsMobileMenuOpen(false);
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

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
    if (session?.authenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 selection:bg-accent selection:text-white transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      {/* Outer Kiosk Machine Enclosure */}
      <div className="w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-chassis border border-chassis-bezel shadow-luxury p-2.5 sm:p-5 md:p-6 transition-all duration-200 relative overflow-x-hidden">
        
        {/* Terminal Canopy Header */}
        <header className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-border-subtle gap-2">
          {/* Left: Interactive Brand Logo + Back Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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
              className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl p-1 -m-1 transition-all select-none"
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

          {/* Right: Controls + Mobile Hamburger Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Clock (Large screens) */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-tertiary mr-1">
              <Clock className="w-3 h-3" />
              <span>{timeStr}</span>
            </div>

            {/* Desktop Quick Toggles (Hidden on small mobile to prevent cramping) */}
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
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-surface-subdued hover:bg-surface-hover border border-border-subtle text-primary transition-colors cursor-pointer select-none"
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-accent" />
              ) : (
                <Menu className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay & Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                aria-hidden="true"
              />

              {/* Sliding Drawer Content */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-50 bg-surface border-l border-border-strong shadow-2xl p-5 flex flex-col justify-between overflow-y-auto"
                role="dialog"
                aria-label="Mobile Navigation Menu"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary text-surface flex items-center justify-center font-bold text-xs">
                        AP
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">APEX Touch ATM</div>
                        <div className="text-[10px] text-tertiary font-mono">Terminal Mumbai-04</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg text-secondary hover:text-primary bg-surface-subdued border border-border-subtle"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Session Info Card (if authenticated) */}
                  {session?.authenticated && (
                    <div className="p-3.5 rounded-xl bg-surface-subdued border border-border-subtle mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary">
                          {session.customerName || account?.fullName || 'Client'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-accent font-semibold border border-border-subtle">
                          {account?.accountType?.replace(' Account', '') || 'Savings'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-tertiary mt-1">
                        Acc: {session.cardNumber}
                      </div>
                      <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between items-center text-xs">
                        <span className="text-tertiary text-[10px] uppercase font-mono">Available:</span>
                        <span className="font-bold font-mono text-accent text-sm">
                          ₹{(account?.availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links List */}
                  <div className="space-y-1 mb-5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-tertiary mb-2 px-1">
                      Terminal Operations
                    </div>

                    {session?.authenticated ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/dashboard');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            location.pathname === '/dashboard'
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-primary hover:bg-surface-subdued'
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4 text-accent" />
                          <span>Main Dashboard</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/balance');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            location.pathname === '/balance'
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-primary hover:bg-surface-subdued'
                          }`}
                        >
                          <Wallet className="w-4 h-4 text-accent" />
                          <span>Balance Inquiry</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/withdraw');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            location.pathname === '/withdraw'
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-primary hover:bg-surface-subdued'
                          }`}
                        >
                          <ArrowUpRight className="w-4 h-4 text-accent" />
                          <span>Cash Withdrawal</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/deposit');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            location.pathname === '/deposit'
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-primary hover:bg-surface-subdued'
                          }`}
                        >
                          <ArrowDownLeft className="w-4 h-4 text-accent" />
                          <span>Cash Deposit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/transfer');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            location.pathname === '/transfer'
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-primary hover:bg-surface-subdued'
                          }`}
                        >
                          <ArrowLeftRight className="w-4 h-4 text-accent" />
                          <span>Funds Transfer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/history');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            location.pathname === '/history'
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-primary hover:bg-surface-subdued'
                          }`}
                        >
                          <FileText className="w-4 h-4 text-accent" />
                          <span>Transaction History</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigate('/change-pin');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            location.pathname === '/change-pin'
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-primary hover:bg-surface-subdued'
                          }`}
                        >
                          <KeyRound className="w-4 h-4 text-accent" />
                          <span>Change PIN</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleEject}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left text-danger hover:bg-danger-subtle/20 transition-colors cursor-pointer mt-2"
                        >
                          <LogOut className="w-4 h-4 text-danger" />
                          <span>Eject Card & Exit</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left bg-accent/10 text-accent font-semibold cursor-pointer"
                        >
                          <Home className="w-4 h-4 text-accent" />
                          <span>Welcome & Card Insertion</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsHelpModalOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left text-primary hover:bg-surface-subdued transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-accent" />
                          <span>Demo Accounts & Guide</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Device Preferences in Drawer */}
                  <div className="pt-3 border-t border-border-subtle">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-tertiary mb-2 px-1">
                      Preferences
                    </div>
                    <div className="flex items-center gap-3 px-1 py-1">
                      <SoundToggle />
                      <LanguageToggle />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Emergency Contact Links */}
                <div className="pt-4 border-t border-border-subtle space-y-2 text-[11px] text-tertiary">
                  <div className="font-semibold text-secondary text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Apex Terminal Support</span>
                  </div>
                  <div>
                    <a
                      href="tel:18002739000"
                      className="flex items-center gap-2 hover:text-accent transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-secondary" />
                      <span>1800-273-9000 (Toll-Free)</span>
                    </a>
                  </div>
                  <div>
                    <a
                      href="mailto:support@apexbank.demo"
                      className="flex items-center gap-2 hover:text-accent transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-secondary" />
                      <span>support@apexbank.demo</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Inactivity Warning Banner (if session expiring soon) */}
        <AnimatePresence>
          {session?.authenticated && isExpiringSoon && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="w-full px-3 sm:px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse flex-shrink-0" />
                  <span>
                    {t('app.sessionExpiring')}{' '}
                    <strong className="font-mono text-sm">{inactivitySeconds}</strong>{' '}
                    {t('app.seconds')}.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetInactivity}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-medium text-[11px] hover:bg-amber-600 cursor-pointer flex-shrink-0"
                >
                  Stay Logged In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen + Physical Side Keys Bezel Assembly */}
        <div className="flex items-stretch gap-1.5 sm:gap-3 my-2 w-full">
          {/* Left Physical Side Function Keys (L1-L4) - Hidden on mobile */}
          <SideFunctionKeys side="left" />

          {/* Recessed Touchscreen Display Surround */}
          <div className="flex-1 rounded-xl sm:rounded-2xl bg-surface border border-border-strong/50 shadow-pocket p-3 sm:p-5 md:p-6 min-h-[460px] flex flex-col justify-between relative overflow-y-auto overflow-x-hidden w-full">
            <main className="w-full flex-1 flex flex-col justify-between min-h-[400px]">
              {children}
            </main>
          </div>

          {/* Right Physical Side Function Keys (R1-R4) - Hidden on mobile */}
          <SideFunctionKeys side="right" />
        </div>

        {/* Hardware Bay (Card Slot, Note Dispenser with Animated Bills, Receipt Printer, Keypad) */}
        <HardwareConsole />
      </div>

      {/* Professional Responsive Terminal Footer */}
      <footer className="mt-3 w-full max-w-5xl px-2 text-[11px] text-tertiary flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-border-subtle/40 pt-3">
        {/* Left: Dynamic Copyright & Status */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span>© {currentYear} Apex Touch Banking • PCI-PTS Certified Terminal • Hardware Encrypted</span>
        </div>

        {/* Right: Working Navigation & Contact Links */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center text-xs">
          <a
            href="tel:18002739000"
            className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer"
            title="Apex ATM Toll-Free Helpline"
          >
            <Phone className="w-3 h-3 text-secondary" />
            <span>1800-273-9000</span>
          </a>

          <a
            href="mailto:support@apexbank.demo"
            className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer"
            title="Apex ATM Support Email"
          >
            <Mail className="w-3 h-3 text-secondary" />
            <span>support@apexbank.demo</span>
          </a>

          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="hover:text-accent transition-colors cursor-pointer flex items-center gap-1 underline underline-offset-2 decoration-border-subtle hover:decoration-accent"
          >
            <HelpCircle className="w-3 h-3 text-secondary" />
            <span>Demo Instructions</span>
          </button>
        </div>
      </footer>

      {/* Demo Instructions & System Architecture Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="APEX ATM Terminal Guide & Demo Accounts"
      >
        <div className="space-y-4 text-xs text-secondary">
          <p>
            Welcome to the <strong>APEX Touch Banking Simulation</strong>, an academic course project demonstrating <strong>Abstraction</strong>, <strong>Interfaces</strong>, and <strong>Exception Handling</strong> in Java with a full touchscreen physical ATM kiosk.
          </p>

          <div className="p-3 rounded-xl bg-surface-subdued border border-border-subtle space-y-2">
            <span className="font-semibold text-primary block">Available Classroom Test Accounts:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent">CARD1001</span> (PIN: 1234)<br />
                <span>Aarav Sharma • Savings</span><br />
                <span className="text-emerald-500 font-semibold">Active Profile</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent">CARD1002</span> (PIN: 5678)<br />
                <span>Priya Patel • Current</span><br />
                <span className="text-emerald-500 font-semibold">Active Profile</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent">CARD1003</span> (PIN: 4321)<br />
                <span>Rahul Verma • Expired</span><br />
                <span className="text-amber-500 font-semibold">Expired Test Card</span>
              </div>
              <div className="p-2 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent">CARD1004</span> (PIN: 9999)<br />
                <span>Neha Iyer • Blocked</span><br />
                <span className="text-rose-500 font-semibold">Pre-Blocked Card</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border-subtle">
            <span className="text-tertiary">Toll-free Helpdesk:</span>
            <a href="tel:18002739000" className="font-mono text-accent font-semibold hover:underline">
              1800-273-9000
            </a>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsHelpModalOpen(false)}
            >
              Close Guide
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
