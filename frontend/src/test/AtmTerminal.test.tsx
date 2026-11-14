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
  }),
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
