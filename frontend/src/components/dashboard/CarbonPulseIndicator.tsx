import React from 'react';
import { motion } from 'framer-motion';
import { formatCO2e } from '../../lib/formatters';

interface CarbonPulseIndicatorProps {
  weeklyValue: number;
  weeklyTarget: number;
}

export const CarbonPulseIndicator: React.FC<CarbonPulseIndicatorProps> = ({
  weeklyValue,
  weeklyTarget
}) => {
  const percentage = weeklyTarget > 0 ? (weeklyValue / weeklyTarget) * 100 : 0;
  const clampedPct = Math.min(percentage, 100);
  const remaining = Math.max(0, weeklyTarget - weeklyValue);
  const isOverBudget = weeklyValue > weeklyTarget;

  // Circle properties
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  // Colors & glows based on status
  const getTheme = () => {
    if (percentage <= 60) {
      return {
        stroke: 'stroke-emerald-500',
        glow: 'bg-emerald-500/10 shadow-emerald-500/20',
        text: 'text-emerald-400',
        pulseGlow: 'rgba(16, 185, 129, 0.25)'
      };
    } else if (percentage <= 100) {
      return {
        stroke: 'stroke-amber-500',
        glow: 'bg-amber-500/10 shadow-amber-500/20',
        text: 'text-amber-400',
        pulseGlow: 'rgba(245, 158, 11, 0.25)'
      };
    } else {
      return {
        stroke: 'stroke-rose-600',
        glow: 'bg-rose-950/20 shadow-rose-600/20',
        text: 'text-rose-500',
        pulseGlow: 'rgba(225, 29, 72, 0.25)'
      };
    }
  };

  const theme = getTheme();

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-zinc-800 bg-zinc-900/40 rounded-xl backdrop-blur-md">
      <h3 className="text-sm font-bold text-text-primary tracking-tight mb-6">
        Carbon Pulse
      </h3>
      
      <div className="relative flex items-center justify-center h-48 w-48">
        {/* Pulsing Outer Glow */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute inset-4 rounded-full blur-xl transition-all duration-500 ${theme.glow}`}
        />

        {/* Circular SVG Progress */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            className={`transition-colors duration-500 ${theme.stroke}`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Text Inside Circle */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-3xl font-extrabold text-white font-display">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mt-1">
            Budget Used
          </span>
        </div>
      </div>

      {/* Target details footer */}
      <div className="mt-6 w-full grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-4 text-center">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Weekly Target</span>
          <span className="text-sm font-bold text-white mt-0.5">{formatCO2e(weeklyTarget)}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-500">
            {isOverBudget ? 'Exceeded By' : 'Remaining'}
          </span>
          <span className={`text-sm font-bold mt-0.5 ${isOverBudget ? 'text-rose-500' : 'text-emerald-400'}`}>
            {formatCO2e(isOverBudget ? weeklyValue - weeklyTarget : remaining)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CarbonPulseIndicator;
