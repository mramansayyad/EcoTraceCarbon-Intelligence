import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-text-primary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`bg-bg-elevated border ${error ? 'border-danger-red' : 'border-border-color'} text-text-primary rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50 placeholder:text-text-muted transition-all duration-200 ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger-red font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
