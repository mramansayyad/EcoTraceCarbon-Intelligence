import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'elevated' | 'glow';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'base',
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-xl border p-5 transition-all duration-300 backdrop-blur-md';
  
  const variants = {
    base: 'bg-bg-surface border-border-color',
    elevated: 'bg-bg-elevated border-border-color shadow-lg hover:translate-y-[-2px]',
    glow: 'bg-bg-elevated border-accent-green/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
  };

  return (
    <div className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mb-4 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-border-color flex justify-end ${className}`} {...props}>
    {children}
  </div>
);
