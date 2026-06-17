import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'lime';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border';

  const variants = {
    success: 'bg-accent-green/10 text-accent-green border-accent-green/20',
    lime: 'bg-accent-lime/10 text-accent-lime border-accent-lime/20',
    warning: 'bg-warn-amber/10 text-warn-amber border-warn-amber/20',
    danger: 'bg-danger-red/10 text-danger-red border-danger-red/20',
    info: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
