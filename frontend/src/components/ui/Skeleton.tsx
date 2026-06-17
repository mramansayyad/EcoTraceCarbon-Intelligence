import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  className = '',
  ...props
}) => {
  const baseStyle = 'animate-pulse bg-bg-elevated border border-border-color/30';
  
  const variants = {
    text: 'h-4 w-3/4 rounded',
    rect: 'h-24 w-full rounded-xl',
    circle: 'h-12 w-12 rounded-full'
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
