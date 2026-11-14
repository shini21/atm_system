import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ATMTransition } from '../components/layout/ATMTransition';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { AlertTriangle, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  const handleReturnHome = () => {
    if (session?.authenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <ATMTransition>
      <div className="flex flex-col items-center justify-center text-center py-6 sm:py-10 max-w-lg mx-auto select-none">
        {/* Warning Icon Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-warning-subtle border border-warning/30 flex items-center justify-center mb-6 shadow-sm"
        >
          <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-warning animate-pulse" />
        </motion.div>

        {/* Diagnostic Code */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subdued text-tertiary font-mono text-[11px] mb-3 border border-border-subtle">
          <span>DIAGNOSTIC STATUS: 404_PAGE_NOT_FOUND</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          Screen Not Available
        </h1>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-secondary max-w-md leading-relaxed">
          The ATM navigation route{' '}
          <code className="px-1.5 py-0.5 rounded bg-surface-subdued text-primary font-mono text-xs border border-border-subtle">
            {location.pathname}
          </code>{' '}
          does not exist or is no longer accessible on this terminal.
        </p>

        {/* Technical Terminal Slip */}
        <div className="w-full max-w-sm mt-6 p-3.5 rounded-xl bg-surface-subdued border border-border-subtle text-left font-mono text-[11px] space-y-1.5 text-tertiary">
          <div className="flex justify-between">
            <span>TERMINAL ID:</span>
            <span className="text-primary font-semibold">APEX-X9000-MUM-04</span>
          </div>
          <div className="flex justify-between">
            <span>TIMESTAMP:</span>
            <span className="text-primary">{new Date().toISOString().replace('T', ' ').slice(0, 19)}</span>
          </div>
          <div className="flex justify-between">
            <span>SESSION STATE:</span>
            <span className={session?.authenticated ? 'text-emerald-500 font-semibold' : 'text-secondary'}>
              {session?.authenticated ? 'ACTIVE_AUTHENTICATED' : 'ANONYMOUS'}
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 w-full max-w-xs">
          <Button
            variant="primary"
            size="md"
            onClick={handleReturnHome}
            className="w-full sm:flex-1 justify-center"
            icon={session?.authenticated ? <LayoutDashboard className="w-4 h-4" /> : <Home className="w-4 h-4" />}
          >
            {session?.authenticated ? 'Return to Dashboard' : 'Return to Home'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
            className="w-full sm:flex-1 justify-center"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    </ATMTransition>
  );
};

