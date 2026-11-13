import React from 'react';
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
import { EjectPage } from './pages/EjectPage';

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

// Layout Container that adapts title and back navigation based on route
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const getScreenDetails = (pathname: string) => {
    switch (pathname) {
      case '/':
        return { title: t('title.welcome'), showBack: false };
      case '/pin':
        return { title: t('title.auth'), showBack: false };
      case '/dashboard':
        return { title: t('title.dashboard'), showBack: false };
      case '/balance':
        return { title: t('title.balance'), showBack: true };
      case '/deposit':
        return { title: t('title.deposit'), showBack: true };
      case '/withdraw':
        return { title: t('title.withdraw'), showBack: true };
      case '/transfer':
        return { title: t('title.transfer'), showBack: true };
      case '/history':
        return { title: t('title.history'), showBack: true };
      case '/change-pin':
        return { title: t('title.changePin'), showBack: true };
      case '/eject':
        return { title: t('title.eject'), showBack: false };
      default:
        return { title: '', showBack: false };
    }
  };

  const { title, showBack } = getScreenDetails(location.pathname);

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
        <Route path="/eject" element={<EjectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
