import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Wifi, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface TiltedATMCardProps {
  cardNumber: string;
  cardHolderName?: string;
  expiryDate?: string;
  accountType?: string;
  isBlocked?: boolean;
  isExpired?: boolean;
  isInserting?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TiltedATMCard: React.FC<TiltedATMCardProps> = ({
  cardNumber,
  cardHolderName = 'VALUED CARDHOLDER',
  expiryDate = '12/28',
  accountType = 'Savings Account',
  isBlocked = false,
  isExpired = false,
  isInserting = false,
  onClick,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mouse coordinate values for tilt calculation (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Sheen lighting coordinates (percentages for radial gradient)
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  // Smooth springs for rotation
  const rotateXSpring = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 300,
    damping: 25,
    mass: 0.5,
  });
  const rotateYSpring = useSpring(useTransform(x, [-0.5, 0.5], [-14, 14]), {
    stiffness: 300,
    damping: 25,
    mass: 0.5,
  });

  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Gracefully ignore coarse pointers (touch) for tilt calculations
      if (e.pointerType === 'touch') return;

      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Normalized coordinates from -0.5 to 0.5
      const normalizedX = clientX / rect.width - 0.5;
      const normalizedY = clientY / rect.height - 0.5;

      x.set(normalizedX);
      y.set(normalizedY);

      // Percentage for specular sheen highlight
      mouseX.set((clientX / rect.width) * 100);
      mouseY.set((clientY / rect.height) * 100);
    },
    [x, y, mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    mouseX.set(50);
    mouseY.set(50);
  }, [x, y, mouseX, mouseY]);

  // Clean masked card identifier (e.g., •••• •••• •••• 1001)
  const formatCardNumber = (num: string) => {
    if (!num) return '•••• •••• •••• 0000';
    if (num.startsWith('CARD')) {
      const suffix = num.replace('CARD', '');
      return `•••• •••• •••• ${suffix}`;
    }
    if (num.length >= 4) {
      return `•••• •••• •••• ${num.slice(-4)}`;
    }
    return num;
  };

  const getStatusBadge = () => {
    if (isBlocked) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-danger-subtle text-danger border border-danger/25 backdrop-blur-sm">
          <ShieldAlert className="w-3 h-3" /> Blocked
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-warning-subtle text-warning border border-warning/25 backdrop-blur-sm">
          <Clock className="w-3 h-3" /> Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-success-subtle text-success border border-success/25 backdrop-blur-sm">
        <ShieldCheck className="w-3 h-3" /> Active
      </span>
    );
  };

  return (
    <div
      style={{ perspective: '1100px' }}
      className={`relative inline-block select-none ${className}`}
    >
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={handlePointerLeave}
        onClick={onClick}
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        animate={
          isInserting
            ? {
                y: -50,
                scale: 0.85,
                opacity: 0.25,
                transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
              }
            : {
                y: 0,
                scale: isHovered ? 1.02 : 1,
                opacity: 1,
                transition: { duration: 0.3 },
              }
        }
        className={`relative w-76 h-46 sm:w-84 sm:h-52 rounded-2xl p-6 cursor-pointer transition-shadow duration-300 flex flex-col justify-between overflow-hidden border ${
          isDark
            ? 'bg-gradient-to-br from-[#1B1D22] via-[#14161A] to-[#0D0E11] text-white border-white/10 shadow-[0_18px_42px_rgba(0,0,0,0.65)]'
            : 'bg-gradient-to-br from-[#FFFFFF] via-[#F8F9FA] to-[#EDEDF2] text-gray-900 border-gray-200/90 shadow-[0_14px_34px_rgba(0,0,0,0.08)]'
        }`}
      >
        {/* Dynamic Specular Sheen (Mouse pointer reflection) */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 transition-opacity duration-300"
          animate={{ opacity: isHovered ? (isDark ? 0.18 : 0.45) : 0 }}
          style={{
            background: `radial-gradient(circle at ${mouseX.get()}% ${mouseY.get()}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)`,
          }}
        />

        {/* Top Header: Brand & Status */}
        <div className="relative z-10 flex items-center justify-between" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] tracking-tight shadow-sm ${
                isDark ? 'bg-white text-black' : 'bg-black text-white'
              }`}
            >
              AP
            </div>
            <div>
              <div className="font-semibold text-xs tracking-tight">APEX</div>
              <div
                className={`text-[9px] uppercase tracking-wider font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                TOUCH BANKING • {accountType.replace(' Account', '')}
              </div>
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* Middle Row: Metallic EMV Chip & Contactless */}
        <div className="relative z-10 flex items-center gap-3 my-auto" style={{ transform: 'translateZ(25px)' }}>
          {/* Detailed EMV Chip */}
          <div
            className={`w-10 h-7 rounded-md border p-1 flex flex-col justify-between shadow-xs ${
              isDark
                ? 'bg-gradient-to-tr from-[#3A3D45] via-[#2A2D35] to-[#1E2026] border-white/20'
                : 'bg-gradient-to-tr from-[#E6E8EC] via-[#D8DCE3] to-[#CBCFD8] border-gray-300'
            }`}
          >
            <div className={`w-full h-[1px] rounded ${isDark ? 'bg-white/25' : 'bg-gray-400/50'}`} />
            <div className="flex justify-between items-center px-0.5">
              <div className={`w-2 h-1 rounded-[1px] ${isDark ? 'bg-white/20' : 'bg-gray-400/40'}`} />
              <div className={`w-2 h-1 rounded-[1px] ${isDark ? 'bg-white/20' : 'bg-gray-400/40'}`} />
            </div>
            <div className={`w-full h-[1px] rounded ${isDark ? 'bg-white/25' : 'bg-gray-400/50'}`} />
          </div>

          <Wifi
            className={`w-4 h-4 rotate-90 opacity-70 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          />
        </div>

        {/* Bottom Row: Masked Number, Cardholder Name, Expiry */}
        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <div className="font-mono text-sm sm:text-base tracking-widest font-semibold mb-1">
            {formatCardNumber(cardNumber)}
          </div>

          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-medium">
            <span
              className={`truncate max-w-[190px] ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {cardHolderName}
            </span>
            <span
              className={`font-mono text-[10px] ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              EXP {expiryDate}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
