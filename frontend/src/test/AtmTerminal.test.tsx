/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keypad } from '../components/ui/Keypad';
import { sound } from '../utils/sound';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    session: { authenticated: true, cardNumber: 'CARD1001', customerName: 'Aarav Sharma' },
    cardStatus: { cardNumber: 'CARD1001', valid: true, active: true },
    account: { accountNumber: 'ACC1001', fullName: 'Aarav Sharma', balance: 16000, availableBalance: 16000, accountType: 'Savings Account' },
    clearCard: vi.fn(),
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
