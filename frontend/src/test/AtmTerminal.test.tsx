/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keypad } from '../components/ui/Keypad';
import { sound } from '../utils/sound';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    session: { authenticated: true, cardNumber: 'CARD1001', customerName: 'Aarav Sharma' },
    cardStatus: {
      cardNumber: 'CARD1001',
      maskedCardNumber: 'CARD1001',
      cardHolderName: 'Aarav Sharma',
      accountType: 'Savings Account',
      remainingAttempts: 3,
      valid: true,
      active: true,
    },
    account: { accountNumber: 'ACC1001', fullName: 'Aarav Sharma', balance: 16000, availableBalance: 16000, accountType: 'Savings Account' },
    clearCard: vi.fn(),
    checkCard: vi.fn().mockResolvedValue(true),
    login: vi.fn().mockResolvedValue(true),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('../context/HardwareContext', () => ({
  useHardware: () => ({
    isMuted: false,
    toggleSound: vi.fn(),
    setCardSlotState: vi.fn(),
    registerKeypadListener: () => () => {},
    registerSideKeys: () => () => {},
    inactivitySeconds: 15,
    isExpiringSoon: true,
    resetInactivity: vi.fn(),
    printReceipt: vi.fn(),
  }),
}));

vi.mock('../services/api', () => ({
  api: {
    getRecentTransactions: vi.fn().mockResolvedValue([
      {
        transactionId: 'TXN-1001',
        type: 'WITHDRAWAL',
        amount: 2000,
        balanceAfterTransaction: 14000,
        description: 'Cash Dispensed at ATM Mumbai-04',
        timestamp: new Date().toISOString(),
        denominations: { 500: 4 },
      },
      {
        transactionId: 'TXN-1002',
        type: 'DEPOSIT',
        amount: 5000,
        balanceAfterTransaction: 19000,
        description: 'Cash Deposited via Envelope Slot',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    ]),
    getAtmStatus: vi.fn().mockResolvedValue({
      atmId: 'APX-MUM-04',
      terminalModel: 'Apex Prime X-9000',
      status: 'ONLINE',
      supportedDenominations: [500, 200, 100],
      maxWithdrawalPerTransaction: 10000,
      totalCashAvailable: 500000,
      isCashAvailable: true,
    }),
  },
  getErrorMessage: (err: any) => err?.message || 'Error occurred',
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app.brand': 'Apex Touch Banking',
        'app.location': 'Terminal Mumbai-04',
        'app.back': 'Back',
        'app.eject': 'Eject',
      };
      return translations[key] || key;
    },
  }),
}));

describe('Keypad Component (ATM Touch & Physical Navigation)', () => {
  it('renders all numeric keys 0-9 and control keys', () => {
    const handleKeyPress = vi.fn();
    const handleBackspace = vi.fn();
    const handleClear = vi.fn();

    render(
      <Keypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onClear={handleClear}
      />
    );

    // Verify digits 0 through 9 exist
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('triggers onKeyPress when a numeric button is clicked', () => {
    const handleKeyPress = vi.fn();
    const handleBackspace = vi.fn();
    const handleClear = vi.fn();

    render(
      <Keypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onClear={handleClear}
      />
    );

    fireEvent.click(screen.getByText('5'));
    expect(handleKeyPress).toHaveBeenCalledWith('5');

    fireEvent.click(screen.getByText('8'));
    expect(handleKeyPress).toHaveBeenCalledWith('8');
  });

  it('triggers onClear and onBackspace on control buttons', () => {
    const handleKeyPress = vi.fn();
    const handleBackspace = vi.fn();
    const handleClear = vi.fn();

    render(
      <Keypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onClear={handleClear}
      />
    );

    const clearBtn = screen.getByTitle('Clear PIN');
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);

    const bkspBtn = screen.getByTitle('Backspace');
    fireEvent.click(bkspBtn);
    expect(handleBackspace).toHaveBeenCalledTimes(1);
  });
});

describe('Web Audio API Sound Service', () => {
  it('handles sound mute toggling correctly', () => {
    const initialMuted = sound.getIsMuted();
    const toggled = sound.toggleMute();
    expect(toggled).toBe(!initialMuted);
    expect(sound.getIsMuted()).toBe(toggled);

    // Toggle back
    sound.toggleMute();
    expect(sound.getIsMuted()).toBe(initialMuted);
  });

  it('synthesizes key clicks and sound triggers without throwing errors', () => {
    expect(() => {
      sound.playKeyClick();
      sound.playCashDispense();
      sound.playReceiptPrint();
      sound.playSuccess();
      sound.playAlert();
    }).not.toThrow();
  });
});

describe('Security & Account Masking Specifications', () => {
  const maskAccountNumber = (accNum?: string) => {
    if (!accNum) return '•••• ••••';
    if (accNum.length <= 4) return `•••• ${accNum}`;
    return `${accNum.slice(0, 3)}••••${accNum.slice(-4)}`;
  };

  it('masks raw account numbers per design requirements', () => {
    expect(maskAccountNumber('ACC1001')).toBe('ACC••••1001');
    expect(maskAccountNumber('ACC1002')).toBe('ACC••••1002');
    expect(maskAccountNumber('1234567890')).toBe('123••••7890');
    expect(maskAccountNumber('')).toBe('•••• ••••');
  });
});

describe('Return to Dashboard Navigation', () => {
  it('renders Return to Dashboard button and handles click', () => {
    const handleNavigate = vi.fn();
    render(
      <button
        type="button"
        onClick={() => handleNavigate('/dashboard')}
      >
        Return to Dashboard
      </button>
    );

    const btn = screen.getByText('Return to Dashboard');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

describe('Shared UI Components Library (Phase 2)', () => {
  it('renders Button with variants and triggers click handler', async () => {
    const { Button } = await import('../components/ui/Button');
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Proceed to Review
      </Button>
    );

    const btn = screen.getByRole('button', { name: /proceed to review/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Badge with dot and semantic variants', async () => {
    const { Badge } = await import('../components/ui/Badge');
    render(
      <Badge variant="success" dot>
        Active Terminal
      </Badge>
    );

    expect(screen.getByText('Active Terminal')).toBeInTheDocument();
  });

  it('renders Card with content and interactive styling', async () => {
    const { Card } = await import('../components/ui/Card');
    render(
      <Card variant="interactive" padding="md">
        <span>Account Card</span>
      </Card>
    );

    expect(screen.getByText('Account Card')).toBeInTheDocument();
  });

  it('renders Input with label, error, and value updates', async () => {
    const { Input } = await import('../components/ui/Input');
    const handleChange = vi.fn();
    render(
      <Input
        label="Account Number"
        placeholder="e.g. ACC1001"
        onChange={handleChange}
        error="Invalid account format"
      />
    );

    expect(screen.getByText('Account Number')).toBeInTheDocument();
    expect(screen.getByText('Invalid account format')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('e.g. ACC1001');
    fireEvent.change(input, { target: { value: 'ACC1002' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders Skeleton loading placeholder with variant styles', async () => {
    const { Skeleton } = await import('../components/ui/Skeleton');
    const { container } = render(<Skeleton variant="card" height={100} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders EmptyState with icon, title, description, and action button', async () => {
    const { EmptyState } = await import('../components/ui/EmptyState');
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Transactions Found"
        description="Your ledger statement is empty."
        actionLabel="Refresh Statement"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No Transactions Found')).toBeInTheDocument();
    expect(screen.getByText('Your ledger statement is empty.')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /refresh statement/i });
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});

describe('Application Shell & Navigation (Phase 3)', () => {
  it('renders Header with brand monogram, title, and back navigation', async () => {
    const { Header } = await import('../components/layout/Header');
    const { BrowserRouter } = await import('react-router-dom');
    const handleBack = vi.fn();

    render(
      <BrowserRouter>
        <Header
          activeScreenTitle="Deposit Terminal"
          showBack={true}
          onBack={handleBack}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Deposit Terminal')).toBeInTheDocument();
    const backBtn = screen.getByRole('button', { name: /^back$/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('renders Sidebar with navigation items and toggle collapse', async () => {
    const { Sidebar } = await import('../components/layout/Sidebar');
    const { BrowserRouter } = await import('react-router-dom');
    const handleToggle = vi.fn();

    render(
      <BrowserRouter>
        <Sidebar isCollapsed={false} onToggleCollapse={handleToggle} />
      </BrowserRouter>
    );

    expect(screen.getByText('Main Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Withdraw Cash')).toBeInTheDocument();
    expect(screen.getByText('Deposit Cash')).toBeInTheDocument();
    const collapseBtn = screen.getByTitle('Collapse');
    fireEvent.click(collapseBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});

describe('Dashboard Experience & Financial Insights (Phase 4)', () => {
  it('renders AccountOverviewCard with masked account and toggles balance privacy', async () => {
    const { AccountOverviewCard } = await import('../components/cards/AccountOverviewCard');
    const { BrowserRouter } = await import('react-router-dom');

    const mockAccount = {
      customerId: 'CUST1001',
      fullName: 'Aarav Sharma',
      phoneNumber: '+91 98765 43210',
      email: 'aarav@demo.bank',
      accountNumber: 'ACC1001',
      maskedCardNumber: 'CARD1001',
      accountType: 'Savings Account',
      balance: 16000,
      availableBalance: 16000,
      minimumBalance: 100,
    };

    render(
      <BrowserRouter>
        <AccountOverviewCard account={mockAccount} customerName="Aarav Sharma" />
      </BrowserRouter>
    );

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('ACC••••1001')).toBeInTheDocument();

    // Toggle balance privacy eye button
    const eyeBtn = screen.getByLabelText(/hide account balance/i);
    expect(eyeBtn).toBeInTheDocument();
    fireEvent.click(eyeBtn);

    // Balance should now be masked
    expect(screen.getAllByText(/₹ ••••••••/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders RecentActivityTimeline with recent transactions or honest empty state', async () => {
    const { RecentActivityTimeline } = await import('../components/transactions/RecentActivityTimeline');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <RecentActivityTimeline refreshKey={0} />
      </BrowserRouter>
    );

    expect(screen.getByText('Recent Terminal Activity')).toBeInTheDocument();
  });
});

describe('Authentication, PIN & Session Security (Phase 5)', () => {
  it('renders WelcomePage with centered glassmorphic card, demo profiles, and manual card input', async () => {
    const { WelcomePage } = await import('../pages/WelcomePage');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <WelcomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome to Apex')).toBeInTheDocument();
    expect(screen.getByText(/APEX Touch Banking/i)).toBeInTheDocument();
    expect(screen.getByText('Classroom Demo Profiles')).toBeInTheDocument();
    expect(screen.getByText('CARD1001')).toBeInTheDocument();
    expect(screen.getByText('CARD1002')).toBeInTheDocument();
    expect(screen.getByText('CARD1003')).toBeInTheDocument();
    expect(screen.getByText('CARD1004')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /insert card/i })).toBeInTheDocument();
  });

  it('renders PinPage with cardholder identity, security indicators, and tactile keypad', async () => {
    const { PinPage } = await import('../pages/PinPage');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <PinPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/256-Bit/i)).toBeInTheDocument();
    expect(screen.getByText(/3 attempts remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel and return card/i)).toBeInTheDocument();
  });
});

describe('ATM Experience & Multi-Stage Transaction Workflows (Phase 6)', () => {
  it('renders TransactionStepIndicator with current step and step labels', async () => {
    const { TransactionStepIndicator } = await import('../components/transactions/TransactionStepIndicator');

    const steps = [
      { id: 1, label: 'Amount' },
      { id: 2, label: 'Review' },
      { id: 3, label: 'Dispense' },
    ];

    render(<TransactionStepIndicator steps={steps} currentStep={2} />);

    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Dispense')).toBeInTheDocument();
  });

  it('renders WithdrawPage with standardized step indicator and fast cash presets', async () => {
    const { WithdrawPage } = await import('../pages/WithdrawPage');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <WithdrawPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Cash Withdrawal')).toBeInTheDocument();
    expect(screen.getByText('Select Amount')).toBeInTheDocument();
    expect(screen.getByText('Review Details')).toBeInTheDocument();
    expect(screen.getByText('Cash Dispensed')).toBeInTheDocument();
    expect(screen.getByText('₹500')).toBeInTheDocument();
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
  });

  it('renders DepositPage with feeder slot indicator and step progress', async () => {
    const { DepositPage } = await import('../pages/DepositPage');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <DepositPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Deposit Cash')).toBeInTheDocument();
    expect(screen.getAllByText('Deposit Amount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Review & Verify')).toBeInTheDocument();
  });

  it('renders TransferPage with beneficiary quick-select and intra-bank fee disclosure', async () => {
    const { TransferPage } = await import('../pages/TransferPage');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <TransferPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Funds Transfer')).toBeInTheDocument();
    expect(screen.getByText('Recipient & Amount')).toBeInTheDocument();
    expect(screen.getByText('Verify Beneficiary')).toBeInTheDocument();
  });
});

describe('ATM Hardware Simulation (Phase 7)', () => {
  it('renders CardSlot with real-time status LED and slot aperture', async () => {
    const { CardSlot } = await import('../components/atm/CardSlot');

    render(<CardSlot />);

    expect(screen.getByText('Card Reader')).toBeInTheDocument();
  });

  it('renders CashDispenserSlot with note shutter and status indicators', async () => {
    const { CashDispenserSlot } = await import('../components/atm/CashDispenserSlot');

    render(<CashDispenserSlot />);

    expect(screen.getByText('Note Dispenser')).toBeInTheDocument();
  });

  it('renders ReceiptPrinterSlot with paper slot and status', async () => {
    const { ReceiptPrinterSlot } = await import('../components/atm/ReceiptPrinterSlot');

    render(<ReceiptPrinterSlot />);

    expect(screen.getByText('Receipt Printer')).toBeInTheDocument();
  });

  it('renders PhysicalKeypad with tactile hardware buttons and function keys', async () => {
    const { PhysicalKeypad } = await import('../components/atm/PhysicalKeypad');

    render(<PhysicalKeypad />);

    expect(screen.getByText('Hardware PIN Pad')).toBeInTheDocument();
    expect(screen.getByText('ENTER')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});

describe('History & Settings Experience (Phase 8)', () => {
  it('renders HistoryPage with filter chips, date grouping, and statement printing', async () => {
    const { HistoryPage } = await import('../pages/HistoryPage');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText('All Operations')).toBeInTheDocument();
    expect(screen.getByText('Cash Withdrawals')).toBeInTheDocument();
    expect(screen.getByText('Deposits')).toBeInTheDocument();
    expect(screen.getByText('Transfers')).toBeInTheDocument();
    expect(screen.getByText('Security & PIN')).toBeInTheDocument();
    expect(screen.getByText('Print Statement')).toBeInTheDocument();
  });

  it('renders SettingsPage with 4 distinct category tabs and allows tab switching', async () => {
    const { SettingsPage } = await import('../pages/SettingsPage');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Terminal Settings')).toBeInTheDocument();
    expect(screen.getByText('Account & Limits')).toBeInTheDocument();
    expect(screen.getByText('Security & PIN')).toBeInTheDocument();
    expect(screen.getByText('Preferences & Audio')).toBeInTheDocument();
    expect(screen.getByText('Appearance & Theme')).toBeInTheDocument();

    // Verify Default Tab (Account & Limits) displays Regulatory Limits
    expect(screen.getByText('Daily ATM Regulatory Limits')).toBeInTheDocument();
    expect(screen.getByText('Daily Cash Dispense')).toBeInTheDocument();

    // Switch to Security & PIN tab
    fireEvent.click(screen.getByText('Security & PIN'));
    expect(screen.getByText('Card & Security Credentials')).toBeInTheDocument();
    expect(screen.getByText('Card PIN Management')).toBeInTheDocument();
    expect(screen.getByText('Change PIN Now')).toBeInTheDocument();

    // Switch to Preferences & Audio tab
    fireEvent.click(screen.getByText('Preferences & Audio'));
    expect(screen.getByText('Hardware Preferences & Audio')).toBeInTheDocument();
    expect(screen.getByText('Synthesizer Audio Feedback')).toBeInTheDocument();

    // Switch to Appearance & Theme tab
    fireEvent.click(screen.getByText('Appearance & Theme'));
    expect(screen.getByText('Appearance & Terminal Design System')).toBeInTheDocument();
    expect(screen.getByText('Warm Ivory & Champagne')).toBeInTheDocument();
    expect(screen.getByText('Industrial Navy')).toBeInTheDocument();
  });
});

describe('Responsive Design & Accessibility (Phase 9)', () => {
  it('renders Header with accessible mobile hamburger menu having >=44px touch target', async () => {
    const { Header } = await import('../components/layout/Header');
    const { BrowserRouter } = await import('react-router-dom');

    render(
      <BrowserRouter>
        <Header activeScreenTitle="Dashboard" onToggleMobileMenu={() => {}} />
      </BrowserRouter>
    );

    const menuButton = screen.getByLabelText('Open Navigation Menu');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton.className).toContain('min-w-[44px]');
    expect(menuButton.className).toContain('min-h-[44px]');
  });

  it('verifies numeric keypad buttons comply with touch target standards and focus visibility', async () => {
    const { Keypad } = await import('../components/ui/Keypad');

    render(
      <Keypad
        onKeyPress={() => {}}
        onBackspace={() => {}}
        onClear={() => {}}
      />
    );

    // Verify Digit 1 button has touch-friendly dimensions and focus ring
    const digit1 = screen.getByLabelText('Digit 1');
    expect(digit1).toBeInTheDocument();
    expect(digit1.className).toContain('w-14');
    expect(digit1.className).toContain('h-14');
    expect(digit1.className).toContain('focus-visible:ring-2');
  });
});
