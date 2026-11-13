import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { sound } from '../utils/sound';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export interface DispensedCash {
  amount: number;
  breakdown: Record<number, number>;
}

export interface ReceiptData {
  transactionId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  timestamp: string;
  accountNumber: string;
  cardHolderName?: string;
  terminalId?: string;
}

export interface SideKeyAction {
  id: string; // 'L1' | 'L2' | 'L3' | 'L4' | 'R1' | 'R2' | 'R3' | 'R4'
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface HardwareContextType {
  // Card Reader
  cardSlotState: 'empty' | 'inserted' | 'reading' | 'ejected' | 'blocked';
  setCardSlotState: (state: 'empty' | 'inserted' | 'reading' | 'ejected' | 'blocked') => void;

  // Cash Dispenser
  dispenserState: 'idle' | 'dispensing' | 'dispensed' | 'collected';
  dispensedCash: DispensedCash | null;
  triggerDispense: (amount: number, breakdown: Record<number, number>) => void;
  collectCash: () => void;

  // Receipt Printer
  receiptState: 'idle' | 'printing' | 'ready';
  currentReceipt: ReceiptData | null;
  printReceipt: (data: ReceiptData) => void;
  collectReceipt: () => void;

  // Physical Side Function Keys (L1-L4, R1-R4)
  sideKeys: Record<string, SideKeyAction | null>;
  registerSideKeys: (actions: Record<string, SideKeyAction | null>) => () => void;
  triggerSideKey: (keyId: string) => void;

  // Inactivity Timer
  inactivitySeconds: number;
  isExpiringSoon: boolean;
  resetInactivity: () => void;

  // Sound State
  isMuted: boolean;
  toggleSound: () => boolean;

  // Physical Keypad Event Broadcaster
  activeKeypadKey: string | null;
  pressKeypad: (key: string) => void;
  registerKeypadListener: (listener: (key: string) => void) => () => void;
}

const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 60; // 60 seconds

export const HardwareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  // Card slot
  const [cardSlotState, setCardSlotState] = useState<'empty' | 'inserted' | 'reading' | 'ejected' | 'blocked'>('empty');

  // Cash dispenser
  const [dispenserState, setDispenserState] = useState<'idle' | 'dispensing' | 'dispensed' | 'collected'>('idle');
  const [dispensedCash, setDispensedCash] = useState<DispensedCash | null>(null);

  // Receipt printer
  const [receiptState, setReceiptState] = useState<'idle' | 'printing' | 'ready'>('idle');
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  // Inactivity countdown
  const [inactivitySeconds, setInactivitySeconds] = useState<number>(INACTIVITY_TIMEOUT);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getIsMuted());

  // Physical Side Function Keys registry (L1-L4, R1-R4)
  const [sideKeys, setSideKeys] = useState<Record<string, SideKeyAction | null>>({});

  // Keypad listener registry & active pressed key state
  const [activeKeypadKey, setActiveKeypadKey] = useState<string | null>(null);
  const keypadListenersRef = useRef<Set<(key: string) => void>>(new Set());

  // Synchronize card slot state with session
  useEffect(() => {
    if (session?.authenticated) {
      setCardSlotState('inserted');
    } else if (cardSlotState === 'inserted') {
      setCardSlotState('empty');
    }
  }, [session?.authenticated]);

  // Reset inactivity timer on any user interaction
  const resetInactivity = useCallback(() => {
    setInactivitySeconds(INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    const handleUserActivity = () => {
      resetInactivity();
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [resetInactivity]);

  // Inactivity countdown ticker
  useEffect(() => {
    if (!session?.authenticated) {
      setInactivitySeconds(INACTIVITY_TIMEOUT);
      return;
    }

    const timer = setInterval(() => {
      setInactivitySeconds((prev) => {
        if (prev <= 1) {
          // Timeout reached: eject & logout
          sound.playAlert();
          logout().finally(() => {
            setCardSlotState('ejected');
            navigate('/eject?reason=timeout');
          });
          return 0;
        }
        if (prev === 21) {
          sound.playAlert();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.authenticated, logout, navigate]);

  // Dispenser controls
  const triggerDispense = (amount: number, breakdown: Record<number, number>) => {
    setDispenserState('dispensing');
    setDispensedCash({ amount, breakdown });
    sound.playCashDispense();

    setTimeout(() => {
      setDispenserState('dispensed');
      sound.playSuccess();
    }, 1200);
  };

  const collectCash = () => {
    sound.playKeyClick();
    setDispenserState('collected');
    setTimeout(() => {
      setDispenserState('idle');
      setDispensedCash(null);
    }, 600);
  };

  // Receipt printer controls
  const printReceipt = (data: ReceiptData) => {
    setCurrentReceipt(data);
    setReceiptState('printing');
    sound.playReceiptPrint();

    setTimeout(() => {
      setReceiptState('ready');
      sound.playSuccess();
    }, 1000);
  };

  const collectReceipt = () => {
    sound.playKeyClick();
    setReceiptState('idle');
  };

  // Sound toggle
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    return muted;
  };

  // Side function keys controls
  const registerSideKeys = useCallback((actions: Record<string, SideKeyAction | null>) => {
    setSideKeys((prev) => ({ ...prev, ...actions }));
    return () => {
      setSideKeys((prev) => {
        const next = { ...prev };
        Object.keys(actions).forEach((k) => {
          delete next[k];
        });
        return next;
      });
    };
  }, []);

  const triggerSideKey = useCallback((keyId: string) => {
    sound.playKeyClick();
    resetInactivity();
    const action = sideKeys[keyId];
    if (action && !action.disabled) {
      action.onClick();
    }
  }, [sideKeys, resetInactivity]);

  // Keypad broadcaster with tactile key state simulation
  const pressKeypad = useCallback((key: string) => {
    sound.playKeyClick();
    resetInactivity();
    setActiveKeypadKey(key);
    setTimeout(() => {
      setActiveKeypadKey((prev) => (prev === key ? null : prev));
    }, 150);

    keypadListenersRef.current.forEach((listener) => {
      try {
        listener(key);
      } catch {
        // Safe listener error catch
      }
    });
  }, [resetInactivity]);

  // Comprehensive physical keyboard listener (supports top-row numbers, laptop Numpad with NumLock ON/OFF, Enter, Bksp, Esc, Clear)
  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      // Do not hijack keystrokes if the user is typing inside an <input> or <textarea>
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      let key = '';

      // 1. Detect Digits (0-9):
      // - Standard e.key (e.g. '0'-'9')
      // - e.code 'Numpad0'-'Numpad9' (works regardless of NumLock state on Windows laptops)
      // - e.code 'Digit0'-'Digit9'
      if (/^[0-9]$/.test(e.key)) {
        key = e.key;
      } else if (e.code && /^Numpad([0-9])$/.test(e.code)) {
        key = e.code.replace('Numpad', '');
      } else if (e.code && /^Digit([0-9])$/.test(e.code)) {
        key = e.code.replace('Digit', '');
      }

      // 2. Navigation & Control Keys
      if (e.key === 'Backspace' || e.code === 'Backspace') {
        key = 'BACKSPACE';
        e.preventDefault();
      } else if (e.key === 'Enter' || e.code === 'NumpadEnter') {
        key = 'ENTER';
        e.preventDefault();
      } else if (e.key === 'Escape') {
        key = 'CANCEL';
        e.preventDefault();
      } else if (e.key === 'Delete' || e.key === 'c' || e.key === 'C' || e.code === 'NumpadDecimal') {
        key = 'CLEAR';
        e.preventDefault();
      }

      if (key) {
        pressKeypad(key);
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => window.removeEventListener('keydown', handlePhysicalKeyDown);
  }, [pressKeypad]);

  const registerKeypadListener = (listener: (key: string) => void) => {
    keypadListenersRef.current.add(listener);
    return () => {
      keypadListenersRef.current.delete(listener);
    };
  };

  return (
    <HardwareContext.Provider
      value={{
        cardSlotState,
        setCardSlotState,
        dispenserState,
        dispensedCash,
        triggerDispense,
        collectCash,
        receiptState,
        currentReceipt,
        printReceipt,
        collectReceipt,
        sideKeys,
        registerSideKeys,
        triggerSideKey,
        inactivitySeconds,
        isExpiringSoon: session?.authenticated ? inactivitySeconds <= 20 : false,
        resetInactivity,
        isMuted,
        toggleSound,
        activeKeypadKey,
        pressKeypad,
        registerKeypadListener,
      }}
    >
      {children}
    </HardwareContext.Provider>
  );
};

export const useHardware = (): HardwareContextType => {
  const context = useContext(HardwareContext);
  if (!context) {
    throw new Error('useHardware must be used within a HardwareProvider');
  }
  return context;
};

