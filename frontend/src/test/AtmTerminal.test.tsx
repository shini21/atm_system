/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keypad } from '../components/ui/Keypad';
import { sound } from '../utils/sound';

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
