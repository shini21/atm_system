import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  CardStatus,
  AccountDetails,
  BalanceInfo,
  TransactionItem,
  AuthSession,
} from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Auth
  async checkCard(cardNumber: string): Promise<CardStatus> {
    const res = await apiClient.post<ApiResponse<CardStatus>>('/auth/card', { cardNumber });
    return res.data.data;
  },

  async login(cardNumber: string, pin: string): Promise<AuthSession> {
    const res = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', { cardNumber, pin });
    return res.data.data;
  },

  async getSession(): Promise<AuthSession> {
    const res = await apiClient.get<ApiResponse<AuthSession>>('/auth/session');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async changePin(currentPin: string, newPin: string, confirmPin: string): Promise<void> {
    await apiClient.post('/auth/change-pin', { currentPin, newPin, confirmPin });
  },

  // Account
  async getAccountDetails(): Promise<AccountDetails> {
    const res = await apiClient.get<ApiResponse<AccountDetails>>('/account/details');
    return res.data.data;
  },

  async getBalance(): Promise<BalanceInfo> {
    const res = await apiClient.get<ApiResponse<BalanceInfo>>('/account/balance');
    return res.data.data;
  },

  // Transactions
  async deposit(amount: number): Promise<TransactionItem> {
    const res = await apiClient.post<ApiResponse<TransactionItem>>('/transactions/deposit', { amount });
    return res.data.data;
  },

  async withdraw(amount: number): Promise<TransactionItem> {
    const res = await apiClient.post<ApiResponse<TransactionItem>>('/transactions/withdraw', { amount });
    return res.data.data;
  },

  async transfer(recipientAccountNumber: string, amount: number): Promise<TransactionItem> {
    const res = await apiClient.post<ApiResponse<TransactionItem>>('/transactions/transfer', {
      recipientAccountNumber,
      amount,
    });
    return res.data.data;
  },

  async getRecentTransactions(limit: number = 5): Promise<TransactionItem[]> {
    const res = await apiClient.get<ApiResponse<TransactionItem[]>>('/transactions/recent', {
      params: { limit },
    });
    return res.data.data;
  },
};

export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
