import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ProgressRingProps {
  stage: 'idle' | 'validating' | 'processing' | 'completing' | 'success' | 'error';
  stageLabel?: string;
  size?: number;
  strokeWidth?: number;
  errorMessage?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  stage,
  stageLabel,
  size = 120,
  strokeWidth = 6,
  errorMessage,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const stageConfig = {
    idle: {
      color: 'text-border-subtle',
      progress: 0.1,
      label: stageLabel || 'Ready',
      sublabel: 'Awaiting submission',
      isIndeterminate: false,
    },
    validating: {
      color: 'text-cyan',
      progress: 0.35,
      label: stageLabel || 'Validating',
      sublabel: 'Checking credentials...',
      isIndeterminate: true,
    },
    processing: {
      color: 'text-cyan',
      progress: 0.7,
      label: stageLabel || 'Processing',
      sublabel: 'Transacting with ledger...',
      isIndeterminate: true,
    },
    completing: {
      color: 'text-accent',
      progress: 0.9,
      label: stageLabel || 'Completing',
      sublabel: 'Updating balances...',
      isIndeterminate: true,
    },
    success: {
      color: 'text-success',
      progress: 1.0,
      label: stageLabel || 'Success',
      sublabel: 'Transaction Confirmed',
      isIndeterminate: false,
    },
    error: {
      color: 'text-danger',
      progress: 1.0,
      label: stageLabel || 'Failed',
      sublabel: errorMessage || 'Transaction Rejected',
      isIndeterminate: false,
    },
  }[stage];

  const strokeDashoffset = circumference - stageConfig.progress * circumference;

  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-border-subtle"
          />

          {/* Animated Stage Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className={stageConfig.color}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset,
              rotate: stageConfig.isIndeterminate ? 360 : 0,
            }}
            transition={
              stageConfig.isIndeterminate
                ? {
                    rotate: { repeat: Infinity, duration: 2, ease: 'linear' },
                    strokeDashoffset: { duration: 0.6, ease: 'easeOut' },
                  }
                : { duration: 0.5, ease: 'easeOut' }
            }
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
          {stage === 'success' ? (
            <CheckCircle2 className="w-8 h-8 text-success animate-in zoom-in-75 duration-300" />
          ) : stage === 'error' ? (
            <AlertCircle className="w-8 h-8 text-danger animate-in zoom-in-75 duration-300" />
          ) : (
            <span className="text-xs font-semibold text-primary font-sans leading-tight">
              {stageConfig.label}
            </span>
          )}
        </div>
      </div>

      {/* Sublabel status */}
      <div className="mt-3">
        <span className="text-[11px] font-mono text-tertiary block">
          {stageConfig.sublabel}
        </span>
      </div>
    </div>
  );
};

