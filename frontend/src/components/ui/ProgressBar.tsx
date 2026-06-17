import React from 'react';

interface ProgressBarProps {
  value: number; // current value
  max: number;   // target/max value
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = false
}) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  
  // Decide color based on how close to target we are
  let barColor = 'bg-accent-green';
  if (percentage >= 100) {
    barColor = 'bg-danger-red';
  } else if (percentage >= 80) {
    barColor = 'bg-warn-amber';
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span className="text-text-secondary">Progress</span>
          <span className={percentage >= 100 ? 'text-danger-red' : 'text-accent-green'}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden border border-border-color">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
