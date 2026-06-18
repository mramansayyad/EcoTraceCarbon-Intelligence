import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Award, TrendingUp } from 'lucide-react';
import { formatCO2e } from '../../lib/formatters';

interface FootprintSummaryCardProps {
  title: string;
  value: number; // in kg CO2e
  type: 'carbon' | 'streak' | 'percentage';
  delta?: number; // delta percentage
  deltaLabel?: string; // e.g. "vs yesterday", "vs national avg"
  icon?: React.ReactNode;
}

export const FootprintSummaryCard: React.FC<FootprintSummaryCardProps> = ({
  title,
  value,
  type,
  delta = 0,
  deltaLabel = '',
  icon
}) => {
  const isPositiveDelta = delta > 0;
  const isZeroDelta = delta === 0;

  // Decide display values
  let displayValue = '';
  if (type === 'carbon') {
    displayValue = formatCO2e(value);
  } else if (type === 'streak') {
    displayValue = `${value} Days`;
  } else if (type === 'percentage') {
    displayValue = `${value}%`;
  }

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      {/* Accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        type === 'streak' ? 'bg-accent-lime' : (delta > 0 && type === 'carbon' ? 'bg-danger-red' : 'bg-accent-green')
      }`} />

      <CardBody className="pl-3 flex flex-col justify-between h-full min-h-[90px]">
        <div className="flex items-center justify-between">
          <span className="text-xxs font-mono uppercase tracking-wider text-text-muted font-bold">
            {title}
          </span>
          <div className="p-1.5 rounded-lg bg-bg-elevated border border-border-color text-text-primary">
            {icon || <TrendingUp className="h-4 w-4" />}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold font-display text-text-primary tracking-tight">
            {displayValue}
          </span>
        </div>

        {/* Delta representation */}
        {deltaLabel && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {type === 'streak' ? (
              <span className="text-accent-lime flex items-center gap-1 font-semibold">
                <Award className="h-3.5 w-3.5" />
                Streak Active
              </span>
            ) : isZeroDelta ? (
              <span className="text-text-muted">No change {deltaLabel}</span>
            ) : (
              <span className={`flex items-center font-bold ${
                isPositiveDelta ? 'text-danger-red' : 'text-accent-green'
              }`}>
                {isPositiveDelta ? (
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                )}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
            {type !== 'streak' && <span className="text-text-muted font-medium">{deltaLabel}</span>}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
export default FootprintSummaryCard;
