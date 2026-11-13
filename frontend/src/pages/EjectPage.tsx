import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHardware } from '../context/HardwareContext';
import { sound } from '../utils/sound';
import { TiltedATMCard } from '../components/cards/TiltedATMCard';
import { ATMTransition } from '../components/layout/ATMTransition';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const EjectPage: React.FC = () => {
  const { session, cardStatus, account, logout } = useAuth();
  const { setCardSlotState } = useHardware();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(6);

  const cardNumber = session?.cardNumber || cardStatus?.cardNumber || 'CARD1001';
  const customerName = session?.customerName || cardStatus?.cardHolderName || account?.fullName || 'Valued Cardholder';
  const accountType = account?.accountType || 'Savings Account';

  useEffect(() => {
    // Perform server-side session logout and trigger hardware ejection
    logout();
    setCardSlotState('ejected');
    sound.playCardEject();

    // 6-second countdown to return to welcome screen
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCardSlotState('empty');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      setCardSlotState('empty');
    };
  }, []);

  return (
    <ATMTransition>
      <div className="flex flex-col items-center justify-center text-center py-4 max-w-lg mx-auto">
        {/* Animated Card Ejection Physical Slot */}
        <div className="relative mb-8 w-full flex flex-col items-center">
          {/* Physical Bezel & Slot Opening */}
          <div className="w-full max-w-[270px] xs:max-w-[290px] sm:max-w-xs h-3 rounded-full bg-surface-subdued border border-border-subtle shadow-inner mx-auto relative z-20 flex items-center justify-center">
            <div className="w-3/4 h-1 bg-border-strong rounded-full opacity-60" />
          </div>

          {/* Card Emerging from Slot */}
          <motion.div
            initial={{ y: 60, opacity: 0.3 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.1 }}
            className="relative z-10 -mt-2"
          >
            <TiltedATMCard
              cardNumber={cardNumber}
              cardHolderName={customerName}
              accountType={accountType}
            />
          </motion.div>
        </div>

        {/* Status & Farewell Notice */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-subtle border border-success/20 text-success text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Session Securely Closed</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary">
            Please Take Your Card
          </h1>

          <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
            Thank you for banking with <strong className="text-primary font-medium">APEX GLOBAL BANK</strong>.
            Please collect your card and any dispensed funds.
          </p>

          <div className="pt-2">
            <p className="text-xs font-mono text-tertiary">
              Returning to welcome screen in <strong className="text-primary font-semibold text-sm">{countdown}s</strong>
            </p>
          </div>

          <div className="pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setCardSlotState('empty');
                navigate('/');
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              className="px-6 py-2.5 font-semibold shadow-md"
            >
              Start New Session
            </Button>
          </div>
        </motion.div>
      </div>
    </ATMTransition>
  );
};
