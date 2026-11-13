export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'PIN_CHANGE';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface CardStatus {
  cardNumber: string;
  maskedCardNumber: string;
  cardHolderName: string;
  accountType: string;
  expiryDate: string;
  blocked: boolean;
  expired: boolean;
  remainingAttempts: number;
}

export interface AccountDetails {
  customerId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  accountNumber: string;
  maskedCardNumber: string;
  accountType: string;
  balance: number;
  availableBalance: number;
  minimumBalance: number;
}

export interface BalanceInfo {
  accountNumber: string;
  accountType: string;
  currentBalance: number;
  availableBalance: number;
  minimumBalance: number;
}

export interface TransactionItem {
  transactionId: string;
  type: TransactionType;
  amount: number;
  balanceAfterTransaction: number;
  description: string;
  timestamp: string;
  denominations?: Record<number, number>;
}

export interface AuthSession {
  authenticated: boolean;
  cardNumber?: string;
  maskedCardNumber?: string;
  accountNumber?: string;
  customerName?: string;
  accountType?: string;
  expiryDate?: string;
}

export interface DemoCard {
  cardNumber: string;
  pin: string;
  holder: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  expiry: string;
  status: 'active' | 'expired' | 'blocked';
  notes: string;
}

