import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware } from '../context/HardwareContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/sound';
import { ATMTransition } from '../components/layout/ATMTransition';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'motion/react';
import {
  User,
  Shield,
  Sliders,
  Palette,
  CreditCard,
  Lock,
  Volume2,
  VolumeX,
  Languages,
  LogOut,
  ArrowLeft,
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon,
  Sparkles,
  Zap,
} from 'lucide-react';

type SettingsCategory = 'account' | 'security' | 'preferences' | 'appearance';

export const SettingsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('account');
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [audioFeedbackSuccess, setAudioFeedbackSuccess] = useState<boolean>(false);

  const { account, session } = useAuth();
  const { isMuted, toggleSound, registerSideKeys } = useHardware();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    return `${accNum.slice(0, 3)}••••${accNum.slice(-4)}`;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleTestAudio = () => {
    sound.playKeyClick();
    setAudioFeedbackSuccess(true);
    setTimeout(() => setAudioFeedbackSuccess(false), 1500);
  };

  // Register physical side function keys on ATM chassis
  useEffect(() => {
    return registerSideKeys({
      L1: {
        id: 'L1',
        label: 'Account & Limits',
        onClick: () => setActiveCategory('account'),
      },
      L2: {
        id: 'L2',
        label: 'Security & PIN',
        onClick: () => setActiveCategory('security'),
      },
      L3: {
        id: 'L3',
        label: 'Preferences',
        onClick: () => setActiveCategory('preferences'),
      },
      L4: {
        id: 'L4',
        label: 'Back to Menu',
        onClick: () => navigate('/dashboard'),
      },
      R1: {
        id: 'R1',
        label: 'Change PIN',
        onClick: () => navigate('/change-pin'),
      },
      R2: {
        id: 'R2',
        label: 'Theme Toggle',
        onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      },
      R3: {
        id: 'R3',
        label: 'Appearance',
        onClick: () => setActiveCategory('appearance'),
      },
      R4: {
        id: 'R4',
        label: 'Eject Card',
        onClick: () => navigate('/eject'),
      },
    });
  }, [registerSideKeys, theme, setTheme, navigate]);

  const categories = [
    {
      id: 'account' as SettingsCategory,
      label: 'Account & Limits',
      icon: <User className="w-4 h-4 flex-shrink-0" />,
      description: 'Account profile, KYC details and daily regulatory ATM limits',
    },
    {
      id: 'security' as SettingsCategory,
      label: 'Security & PIN',
      icon: <Shield className="w-4 h-4 flex-shrink-0" />,
      description: 'Card encryption profile, PIN management and session security',
    },
    {
      id: 'preferences' as SettingsCategory,
      label: 'Preferences & Audio',
      icon: <Sliders className="w-4 h-4 flex-shrink-0" />,
      description: 'Synthesizer audio feedback, language selector and hardware alarms',
    },
    {
      id: 'appearance' as SettingsCategory,
      label: 'Appearance & Theme',
      icon: <Palette className="w-4 h-4 flex-shrink-0" />,
      description: 'Warm Ivory Champagne vs Industrial Navy theme styling',
    },
  ];

  return (
    <ATMTransition>
      <div className="max-w-3xl mx-auto py-2">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between pb-3 mb-4 bg-surface/95 backdrop-blur-xs border-b border-border-subtle">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 font-medium cursor-pointer shadow-xs hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4 text-accent" />
            <span>Return to Dashboard</span>
          </Button>

          <span className="text-[11px] font-mono text-tertiary hidden xs:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-subdued border border-border-subtle text-primary font-bold">Esc</kbd> or <strong className="text-accent font-bold">L4</strong>
          </span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-tertiary font-medium">
              Terminal Configuration
            </span>
            <Badge variant="champagne" size="sm">
              PCI-PTS v6
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
            Terminal Settings
          </h1>
          <p className="text-xs text-secondary mt-1">
            Manage your card credentials, hardware feedback, theme presentation, and account parameters.
          </p>
        </div>

        {/* 4 Category Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-1.5 rounded-2xl bg-surface-subdued border border-border-subtle">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none text-left ${
                  isActive
                    ? 'bg-surface text-primary shadow-xs font-semibold border border-border-strong/60'
                    : 'text-secondary hover:text-primary hover:bg-surface/50'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'text-accent bg-accent/15' : 'text-secondary'
                  }`}
                >
                  {cat.icon}
                </div>
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Content Panels */}
        <div className="rounded-3xl bg-surface-subdued border border-border-subtle p-5 sm:p-6 shadow-sm">
          {/* CATEGORY 1: Account & Limits */}
            {activeCategory === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-base font-semibold text-primary">
                    Account & Regulatory Limits
                  </h2>
                  <p className="text-xs text-tertiary mt-0.5">
                    Authorized profile details retrieved directly from the Banking Core ledger.
                  </p>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-tertiary block">
                        Account Holder
                      </span>
                      <span className="text-sm font-semibold text-primary mt-0.5 block">
                        {account?.fullName || session?.customerName || 'Aarav Sharma'}
                      </span>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Verified
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-tertiary block">
                        Account Number
                      </span>
                      <span className="text-sm font-semibold font-mono text-primary mt-0.5 block">
                        {maskAccountNumber(account?.accountNumber)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(account?.accountNumber || '', 'acc')}
                      className="p-1.5 rounded-lg text-tertiary hover:text-accent hover:bg-surface-subdued transition-colors cursor-pointer"
                      title="Copy account number"
                    >
                      {isCopied === 'acc' ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
                    <span className="text-[10px] uppercase font-mono text-tertiary block">
                      Account Classification
                    </span>
                    <span className="text-sm font-semibold text-primary mt-0.5 block">
                      {account?.accountType || 'Savings Account'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
                    <span className="text-[10px] uppercase font-mono text-tertiary block">
                      Linked Customer ID
                    </span>
                    <span className="text-sm font-semibold font-mono text-primary mt-0.5 block">
                      {account?.customerId || 'CUST-1001'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
                    <span className="text-[10px] uppercase font-mono text-tertiary block">
                      Registered Email
                    </span>
                    <span className="text-xs font-mono text-secondary mt-0.5 block truncate">
                      {account?.email || 'aarav.sharma@apexbank.demo'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-border-subtle">
                    <span className="text-[10px] uppercase font-mono text-tertiary block">
                      Registered Mobile
                    </span>
                    <span className="text-xs font-mono text-secondary mt-0.5 block">
                      {account?.phoneNumber || '+91 98765 43210'}
                    </span>
                  </div>
                </div>

                {/* Regulatory Limits Card */}
                <div className="p-4 rounded-2xl bg-surface border border-border-strong/70 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-xs text-primary">
                      Daily ATM Regulatory Limits
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-subdued border border-border-subtle">
                      <span className="text-[10px] text-tertiary uppercase font-mono block">
                        Daily Cash Dispense
                      </span>
                      <span className="font-semibold font-mono text-sm text-primary mt-0.5 block">
                        ₹25,000.00
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-subdued border border-border-subtle">
                      <span className="text-[10px] text-tertiary uppercase font-mono block">
                        Single Transaction Cap
                      </span>
                      <span className="font-semibold font-mono text-sm text-primary mt-0.5 block">
                        ₹10,000.00
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-subdued border border-border-subtle">
                      <span className="text-[10px] text-tertiary uppercase font-mono block">
                        Minimum Balance Rule
                      </span>
                      <span className="font-semibold font-mono text-sm text-primary mt-0.5 block">
                        ₹{(account?.minimumBalance ?? 500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-tertiary pt-1 border-t border-border-subtle/70">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Zero network surcharges apply to intra-bank transfers and balance inquiries.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CATEGORY 2: Security & PIN */}
            {activeCategory === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-base font-semibold text-primary">
                    Card & Security Credentials
                  </h2>
                  <p className="text-xs text-tertiary mt-0.5">
                    Hardware EMV token cryptographic parameters and PIN security controls.
                  </p>
                </div>

                {/* Card Credential Details */}
                <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-primary font-mono">
                          {session?.cardNumber || account?.maskedCardNumber || 'CARD1001'}
                        </div>
                        <div className="text-[11px] text-tertiary">
                          EMV Smart Chip • Encrypted Hardware Storage
                        </div>
                      </div>
                    </div>

                    <Badge variant="success" size="sm" dot>
                      Active & Secured
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-tertiary block">
                        PIN Protection
                      </span>
                      <span className="font-semibold text-primary mt-0.5 block flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>BCrypt (10 Rounds)</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-tertiary block">
                        Attempt Limit
                      </span>
                      <span className="font-semibold text-primary mt-0.5 block font-mono">
                        3 Consecutive Max
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-tertiary block">
                        Inactivity Auto-Lock
                      </span>
                      <span className="font-semibold text-primary mt-0.5 block font-mono">
                        120 Seconds
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Row: Change PIN Button */}
                <div className="p-4 rounded-2xl bg-surface border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm text-primary flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-accent" />
                      <span>Card PIN Management</span>
                    </div>
                    <p className="text-xs text-tertiary mt-1">
                      Update your 4-digit secret authorization PIN at this terminal.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/change-pin')}
                    className="flex-shrink-0"
                  >
                    Change PIN Now
                  </Button>
                </div>

                {/* Emergency Card Ejection */}
                <div className="p-4 rounded-2xl bg-danger-subtle/30 border border-danger/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm text-danger flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>End Banking Session</span>
                    </div>
                    <p className="text-xs text-tertiary mt-1">
                      Instantly flush authentication session tokens and return your physical card.
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => navigate('/eject')}
                    className="flex-shrink-0"
                  >
                    Eject Card
                  </Button>
                </div>
              </motion.div>
            )}

            {/* CATEGORY 3: Preferences & Audio */}
            {activeCategory === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-base font-semibold text-primary">
                    Hardware Preferences & Audio
                  </h2>
                  <p className="text-xs text-tertiary mt-0.5">
                    Customize tactile sounds and multi-lingual interface preferences.
                  </p>
                </div>

                {/* Audio Feedback Card */}
                <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-primary">
                          Synthesizer Audio Feedback
                        </div>
                        <div className="text-[11px] text-tertiary">
                          Mechanical keypad clicks, cash shutter flutter, and thermal printer sound
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={toggleSound}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                        !isMuted
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-surface-subdued text-secondary border border-border-subtle'
                      }`}
                    >
                      {!isMuted ? 'Muted: OFF' : 'Muted: ON'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-secondary">
                      Verify audio output with synthesizer sample:
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleTestAudio}
                      icon={audioFeedbackSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Sparkles className="w-3.5 h-3.5 text-accent" />}
                    >
                      {audioFeedbackSuccess ? 'Tone Played' : 'Test Audio'}
                    </Button>
                  </div>
                </div>

                {/* Language Selection Card */}
                <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-xs text-primary">
                      Terminal Interface Language
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-accent/10 border-accent text-primary shadow-xs font-semibold'
                          : 'bg-surface-subdued border-border-subtle text-secondary hover:text-primary'
                      }`}
                    >
                      <div className="font-semibold text-sm">English</div>
                      <div className="text-[11px] text-tertiary mt-0.5">Standard International</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguage('hi')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        language === 'hi'
                          ? 'bg-accent/10 border-accent text-primary shadow-xs font-semibold'
                          : 'bg-surface-subdued border-border-subtle text-secondary hover:text-primary'
                      }`}
                    >
                      <div className="font-semibold text-sm">हिन्दी (Hindi)</div>
                      <div className="text-[11px] text-tertiary mt-0.5">राष्ट्रीय भाषा</div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CATEGORY 4: Appearance & Theme */}
            {activeCategory === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-base font-semibold text-primary">
                    Appearance & Terminal Design System
                  </h2>
                  <p className="text-xs text-tertiary mt-0.5">
                    Select your visual design identity in accordance with the APEX Style Guide.
                  </p>
                </div>

                {/* Theme Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Light Theme: Warm Ivory & Champagne */}
                  <div
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
                      theme === 'light'
                        ? 'border-accent bg-[#FDFCFA] shadow-md ring-2 ring-accent/30'
                        : 'border-border-subtle bg-surface hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-sm text-slate-900">
                          Warm Ivory & Champagne
                        </span>
                      </div>
                      {theme === 'light' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent text-white">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mb-4">
                      Luxury European private wealth aesthetic. Warm alabaster, gold accent trims, and high-legibility contrast.
                    </p>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-slate-300" title="Warm Ivory Canvas" />
                      <div className="w-6 h-6 rounded-lg bg-[#C8A86B]" title="Champagne Gold Accent" />
                      <div className="w-6 h-6 rounded-lg bg-[#111827]" title="Deep Charcoal Typography" />
                      <div className="w-6 h-6 rounded-lg bg-[#059669]" title="Emerald Ledger Positive" />
                    </div>
                  </div>

                  {/* Dark Theme: Industrial Navy */}
                  <div
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
                      theme === 'dark'
                        ? 'border-accent bg-[#070A0F] shadow-md ring-2 ring-accent/30'
                        : 'border-border-subtle bg-surface hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold text-sm text-white">
                          Industrial Navy
                        </span>
                      </div>
                      {theme === 'dark' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent text-slate-950">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mb-4">
                      Ultra-secure bank vault terminal aesthetic. Deepest navy canvas, brushed steel chassis, and emerald neon telemetry.
                    </p>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#070A0F] border border-slate-700" title="Industrial Navy Canvas" />
                      <div className="w-6 h-6 rounded-lg bg-[#C8A86B]" title="Champagne Accent" />
                      <div className="w-6 h-6 rounded-lg bg-[#38BDF8]" title="Cyan Bezel Illumination" />
                      <div className="w-6 h-6 rounded-lg bg-[#25D366]" title="Emerald Confirm LED" />
                    </div>
                  </div>
                </div>

                {/* Typography Specimen */}
                <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-2">
                  <div className="text-[10px] uppercase font-mono text-tertiary tracking-wider">
                    Typography Specifications
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-primary block">IBM Plex Sans</span>
                      <span className="text-[11px] text-tertiary">Proportional geometry for UI labels and headers</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold font-mono text-primary block">IBM Plex Mono</span>
                      <span className="text-[11px] font-mono text-tertiary">Tabular numerals: ₹12,345.67</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors cursor-pointer select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </ATMTransition>
  );
};
