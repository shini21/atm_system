import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value = 0,
  className = '',
  prefix = '₹',
  suffix = '',
  decimals = 2,
}) => {
  const safeInitial = typeof value === 'number' && !isNaN(value) ? value : 0;
  const spring = useSpring(safeInitial, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    const safeCurrent = typeof current === 'number' && !isNaN(current) ? current : 0;
    return `${prefix}${safeCurrent.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  useEffect(() => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    spring.set(safeValue);
  }, [value, spring]);

  return <motion.span className={`inline-block font-mono tracking-tight ${className}`}>{display}</motion.span>;
};
