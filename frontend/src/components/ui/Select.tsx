import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || Math.random().toString(36).substring(2, 9);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-text-primary">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`bg-bg-elevated border ${error ? 'border-danger-red' : 'border-border-color'} text-text-primary rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50 placeholder:text-text-muted transition-all duration-200 cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-bg-surface text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} className="text-xs text-danger-red font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
