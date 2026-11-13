import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getErrorMessage } from '../services/api';
import type { CardStatus, AuthSession, AccountDetails, BalanceInfo } from '../types';

interface AuthContextType {
  cardStatus: CardStatus | null;
  session: AuthSession | null;
  account: AccountDetails | null;
  balanceInfo: BalanceInfo | null;
  isLoading: boolean;
  error: string | null;
  checkCard: (cardNumber: string) => Promise<boolean>;
  login: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  clearCard: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cardStatus, setCardStatus] = useState<CardStatus | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check active session on initial load
  useEffect(() => {
    const initSession = async () => {
      try {
        const sess = await api.getSession();
        if (sess && sess.authenticated) {
          setSession(sess);
          const details = await api.getAccountDetails();
          setAccount(details);
          const bal = await api.getBalance();
          setBalanceInfo(bal);
        }
      } catch {
        // No active session
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, []);

  const checkCard = async (cardNumber: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await api.checkCard(cardNumber);
      setCardStatus(status);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (pin: string): Promise<boolean> => {
    if (!cardStatus) {
      setError('Please insert or select a card first.');
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const sess = await api.login(cardStatus.cardNumber, pin);
      setSession(sess);

      // Pre-fetch account details and balance
      try {
        const [details, bal] = await Promise.all([
          api.getAccountDetails(),
          api.getBalance(),
        ]);
        setAccount(details);
        setBalanceInfo(bal);
      } catch {
        // Secondary fetch failure should not block successful authentication;
        // DashboardPage independently refreshes balance and details upon mounting.
      }

      return true;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      // Refresh remaining attempts if possible
      try {
        const updatedStatus = await api.checkCard(cardStatus.cardNumber);
        setCardStatus(updatedStatus);
      } catch {
        // Card may have just been blocked
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setSession(null);
      setCardStatus(null);
      setAccount(null);
      setBalanceInfo(null);
      setIsLoading(false);
    }
  };

  const refreshAccount = async (): Promise<void> => {
    try {
      const details = await api.getAccountDetails();
      setAccount(details);
      const bal = await api.getBalance();
      setBalanceInfo(bal);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const refreshBalance = async (): Promise<void> => {
    try {
      const bal = await api.getBalance();
      setBalanceInfo(bal);
      if (account) {
        setAccount({
          ...account,
          balance: bal.currentBalance,
          availableBalance: bal.availableBalance,
        });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const clearCard = () => {
    setCardStatus(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        cardStatus,
        session,
        account,
        balanceInfo,
        isLoading,
        error,
        checkCard,
        login,
        logout,
        refreshAccount,
        refreshBalance,
        clearCard,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
