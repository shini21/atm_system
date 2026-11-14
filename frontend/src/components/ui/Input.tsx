import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  success?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  isPassword?: boolean;
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightAction,
      isPassword = false,
      isLoading = false,
      disabled,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const helperId = inputId ? `${inputId}-helper` : undefined;
    const errorId = inputId ? `${inputId}-error` : undefined;

    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-secondary tracking-wide select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled || isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full py-2.5 rounded-xl bg-surface-subdued text-primary text-sm font-sans placeholder:text-tertiary border transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${
              isPassword || rightAction || error || success || isLoading ? 'pr-11' : 'pr-3.5'
            } ${
              error
                ? 'border-danger/60 focus:border-danger focus:ring-2 focus:ring-danger/20 text-danger'
                : success
                ? 'border-success/60 focus:border-success focus:ring-2 focus:ring-success/20'
                : 'border-border-subtle hover:border-border-strong focus:border-cyan focus:ring-2 focus:ring-cyan/20'
            } ${className}`}
            {...props}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-cyan" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : error ? (
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
            ) : success ? (
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            ) : isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="p-1 rounded-md text-tertiary hover:text-primary transition-colors cursor-pointer select-none"
                aria-label={showPassword ? 'Hide PIN or password' : 'Show PIN or password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            ) : (
              rightAction
            )}
          </div>
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-danger flex items-center gap-1 mt-1 font-medium">
            <span>{error}</span>
          </p>
        ) : success ? (
          <p className="text-xs text-success flex items-center gap-1 mt-1 font-medium">
            <span>{success}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[11px] text-tertiary mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

