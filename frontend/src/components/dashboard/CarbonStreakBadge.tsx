import React from 'react';
import { Flame, Award, Shield } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';

interface CarbonStreakBadgeProps {
  streakDays: number;
}

export const CarbonStreakBadge: React.FC<CarbonStreakBadgeProps> = ({ streakDays }) => {
  const getMotivationalMessage = (days: number) => {
    if (days === 0) return 'Log today under target to start a streak!';
    if (days < 3) return 'Great start! Keep going under target!';
    if (days < 7) return 'Awesome! You are forming a habit!';
    return 'Carbon Champion status! Unstoppable!';
  };

  const getRankName = (days: number) => {
    if (days < 3) return 'Green Novice';
    if (days < 7) return 'Eco Guardian';
    if (days < 14) return 'Sustainability Hero';
    return 'Climate Champion';
  };

  return (
    <Card variant="base" className="relative overflow-hidden group">
      {/* Background flame glow */}
      <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-105 transition-transform duration-300">
        <Flame className="h-24 w-24 text-accent-lime" />
      </div>

      <CardBody className="flex items-center gap-4">
        {/* Animated Fire Shield */}
        <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 ${
          streakDays > 0 ? 'bg-accent-lime/10 text-accent-lime border border-accent-lime/20' : 'bg-bg-elevated text-text-muted border border-border-color'
        }`}>
          <div className="relative">
            <Flame className={`h-8 w-8 ${streakDays > 0 ? 'animate-bounce' : ''}`} />
            {streakDays > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-lime opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-lime"></span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">
              {streakDays} Day Carbon Streak
            </span>
            <span className="text-xxs px-2 py-0.5 bg-bg-elevated border border-border-color text-accent-lime rounded-full font-bold">
              {getRankName(streakDays)}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {getMotivationalMessage(streakDays)}
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
export default CarbonStreakBadge;
