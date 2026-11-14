import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { HardwareProvider } from './context/HardwareContext';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
import { AtmKiosk } from './components/layout/AtmKiosk';

// Pages
import { WelcomePage } from './pages/WelcomePage';
import { PinPage } from './pages/PinPage';
import { DashboardPage } from './pages/DashboardPage';
import { BalancePage } from './pages/BalancePage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { TransferPage } from './pages/TransferPage';
import { HistoryPage } from './pages/HistoryPage';
import { ChangePinPage } from './pages/ChangePinPage';
import { SettingsPage } from './pages/SettingsPage';
import { EjectPage } from './pages/EjectPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!session?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout Container that adapts title, back navigation, and document metadata based on route
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const getScreenDetails = (pathname: string) => {
    switch (pathname) {
      case '/':
        return {
          title: t('title.welcome'),
          showBack: false,
          pageTitle: 'Apex Touch Banking | Next-Gen ATM Simulation System',
        };
      case '/pin':
        return {
          title: t('title.auth'),
          showBack: false,
          pageTitle: 'Security Authentication | Apex ATM',
        };
      case '/dashboard':
        return {
          title: t('title.dashboard'),
          showBack: false,
          pageTitle: 'Banking Dashboard | Apex ATM',
        };
      case '/balance':
        return {
          title: t('title.balance'),
          showBack: true,
          pageTitle: 'Ledger Balance Inquiry | Apex ATM',
        };
      case '/deposit':
        return {
          title: t('title.deposit'),
          showBack: true,
          pageTitle: 'Cash Deposit Terminal | Apex ATM',
        };
      case '/withdraw':
        return {
          title: t('title.withdraw'),
          showBack: true,
          pageTitle: 'Cash Dispenser | Apex ATM',
        };
      case '/transfer':
        return {
          title: t('title.transfer'),
          showBack: true,
          pageTitle: 'Electronic Funds Transfer | Apex ATM',
        };
      case '/history':
        return {
          title: t('title.history'),
          showBack: true,
          pageTitle: 'Audit Statement & History | Apex ATM',
        };
      case '/change-pin':
        return {
          title: t('title.changePin'),
          showBack: true,
          pageTitle: 'Card PIN Management | Apex ATM',
        };
      case '/settings':
        return {
          title: 'Terminal Settings & Account',
          showBack: true,
          pageTitle: 'Settings & Security | Apex ATM',
        };
      case '/eject':
        return {
          title: t('title.eject'),
          showBack: false,
          pageTitle: 'Card Ejected | Apex ATM',
        };
      default:
        return {
          title: 'Terminal Fault // 404',
          showBack: true,
          pageTitle: '404 Route Not Found | Apex ATM Terminal',
        };
    }
  };

  const { title, showBack, pageTitle } = getScreenDetails(location.pathname);

  // Synchronize browser tab document.title dynamically
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <AtmKiosk activeScreenTitle={title} showBack={showBack}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/pin" element={<PinPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/balance"
          element={
            <ProtectedRoute>
              <BalancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <DepositPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <WithdrawPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <TransferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-pin"
          element={
            <ProtectedRoute>
              <ChangePinPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/eject" element={<EjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AtmKiosk>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <HardwareProvider>
              <AnimatedBackground />
              <AppRoutes />
            </HardwareProvider>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
