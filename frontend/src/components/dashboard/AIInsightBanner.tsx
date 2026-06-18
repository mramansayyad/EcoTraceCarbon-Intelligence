'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import { useInsights } from '../../hooks/useInsights';
import { Skeleton } from '../ui/Skeleton';

export const AIInsightBanner: React.FC = () => {
  const { insight, isLoading, refetch } = useInsights();
  const [index, setIndex] = useState(0);

  // Rotation effect: in a real app we might rotate through 3-4 generated insights.
  // Here we display the main generated weekly insight, and fallbacks if loading.
  const staticTips = [
    "Switching to LED bulbs in your home saves up to 75% of lighting electricity, cutting ~5 kg CO2e monthly.",
    "Carpooling or taking metro to work twice a week decreases transport emissions by up to 25%.",
    "Eating one vegetarian meal per day cuts beef-related food footprints, saving ~12 kg CO2e weekly."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % staticTips.length);
    }, 30000); // Rotate static tips every 30s if AI insight is not loaded
    return () => clearInterval(interval);
  }, [staticTips.length]);

  if (isLoading) {
    return (
      <Card variant="glow" className="mb-6">
        <div className="flex gap-4 items-center">
          <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
          <div className="flex-grow flex flex-col gap-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  const currentTip = insight || staticTips[index];

  return (
    <Card variant="glow" className="mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
        <BrainCircuit className="h-20 w-20 text-accent-emerald" />
      </div>

      <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-accent-green/10 rounded-xl border border-accent-green/20 text-accent-green shrink-0 mt-1 md:mt-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              Gemini AI Sustainability Tip
              <button 
                onClick={() => refetch()} 
                title="Refresh insight"
                className="p-1 rounded-full text-text-muted hover:bg-bg-elevated hover:text-accent-green transition-all cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
              {currentTip}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
export default AIInsightBanner;
