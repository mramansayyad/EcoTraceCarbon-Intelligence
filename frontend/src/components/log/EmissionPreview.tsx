import React from 'react';
import { motion } from 'framer-motion';

interface EmissionPreviewProps {
  emissions: number;
  category: 'transport' | 'food' | 'energy' | 'shopping';
}

export const EmissionPreview: React.FC<EmissionPreviewProps> = ({ emissions, category }) => {
  // Determine impact tier based on category and emissions
  const getImpactTier = (val: number, cat: string) => {
    if (val === 0) return { label: 'Zero', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' };
    
    let lowMax = 2; // transport (e.g. short car ride)
    let medMax = 10;
    
    if (cat === 'food') {
      lowMax = 1;
      medMax = 5;
    } else if (cat === 'energy') {
      lowMax = 20;
      medMax = 100;
    } else if (cat === 'shopping') {
      lowMax = 5;
      medMax = 50;
    }

    if (val <= lowMax) return { label: 'Low Impact', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' };
    if (val <= medMax) return { label: 'Medium Impact', color: 'text-amber-400 bg-amber-950/40 border-amber-800' };
    return { label: 'High Impact', color: 'text-rose-400 bg-rose-950/40 border-rose-800' };
  };

  const tier = getImpactTier(emissions, category);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Estimated Emissions
        </span>
        
        <div className="relative my-4 flex items-baseline justify-center">
          <motion.span 
            key={emissions}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-5xl font-extrabold tracking-tight text-white"
          >
            {emissions.toFixed(2)}
          </motion.span>
          <span className="ml-2 text-lg font-medium text-zinc-400">kg CO₂e</span>
        </div>

        <motion.div
          key={tier.label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all ${tier.color}`}
        >
          {tier.label}
        </motion.div>
        
        <p className="mt-3 text-xs text-zinc-500 max-w-xs leading-relaxed">
          *Calculated locally based on EPA emission standards. The final emission figure may vary slightly when processed on the server.
        </p>
      </div>
    </div>
  );
};

export default EmissionPreview;
