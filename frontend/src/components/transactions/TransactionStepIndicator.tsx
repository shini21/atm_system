import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number | string;
  label: string;
}

interface TransactionStepIndicatorProps {
  steps: StepItem[];
  currentStep: number; // 1-based index: 1, 2, 3...
  className?: string;
}

export const TransactionStepIndicator: React.FC<TransactionStepIndicatorProps> = ({
  steps,
  currentStep,
  className = '',
}) => {
  const progressPercent = steps.length > 1
    ? Math.min(100, Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100))
    : 0;

  return (
    <nav
      aria-label="Transaction progress"
      className={`w-full max-w-md mx-auto mb-6 px-2 select-none ${className}`}
    >
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute left-4 right-4 top-3.5 sm:top-4 h-0.5 bg-border-subtle z-0" />

        {/* Dynamic active progress line */}
        <div
          className="absolute left-4 top-3.5 sm:top-4 h-0.5 bg-champagne dark:bg-accent transition-all duration-300 z-0"
          style={{ width: `calc(${progressPercent}% * 0.88)` }}
        />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-champagne dark:bg-accent text-surface shadow-xs'
                    : isCurrent
                    ? 'bg-surface border-2 border-champagne dark:border-accent text-champagne dark:text-accent shadow-[0_0_10px_rgba(185,148,91,0.35)] dark:shadow-[0_0_10px_rgba(6,182,212,0.35)]'
                    : 'bg-surface border border-border-strong text-tertiary'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : stepNumber}
              </div>
              <span
                className={`mt-1.5 text-[10px] sm:text-[11px] font-medium tracking-tight text-center transition-colors ${
                  isCurrent
                    ? 'text-primary font-semibold'
                    : isCompleted
                    ? 'text-secondary'
                    : 'text-tertiary'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

