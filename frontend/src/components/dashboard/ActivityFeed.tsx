import React from 'react';
interface Activity {
  id: string;
  category: 'transport' | 'food' | 'energy' | 'shopping';
  subcategory: string;
  value: number;
  kg_co2e: number;
  details: any;
  timestamp: string;
}
import { formatCO2e, formatDate } from '../../lib/formatters';
import { 
  Car, 
  Utensils, 
  Zap, 
  ShoppingBag, 
  Trash2,
  Plane,
  Train,
  Flame
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ActivityFeedProps {
  activities: any[];
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onDelete,
  isDeleting = false
}) => {
  const getIcon = (category: string, subcategory: string) => {
    switch (category) {
      case 'transport':
        if (subcategory.startsWith('flight')) return <Plane className="h-4 w-4 text-accent-green" />;
        if (subcategory === 'train' || subcategory === 'metro') return <Train className="h-4 w-4 text-accent-green" />;
        return <Car className="h-4 w-4 text-accent-green" />;
      case 'food':
        return <Utensils className="h-4 w-4 text-warn-amber" />;
      case 'energy':
        if (subcategory === 'electricity') return <Zap className="h-4 w-4 text-accent-emerald" />;
        return <Flame className="h-4 w-4 text-accent-emerald" />;
      case 'shopping':
        return <ShoppingBag className="h-4 w-4 text-accent-lime" />;
      default:
        return <ShoppingBag className="h-4 w-4 text-text-muted" />;
    }
  };

  const getBgColor = (category: string) => {
    switch (category) {
      case 'transport': return 'bg-accent-green/10 border-accent-green/20';
      case 'food': return 'bg-warn-amber/10 border-warn-amber/20';
      case 'energy': return 'bg-accent-emerald/10 border-accent-emerald/20';
      case 'shopping': return 'bg-accent-lime/10 border-accent-lime/25';
      default: return 'bg-bg-elevated border-border-color';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-border-color rounded-xl bg-bg-surface/50 text-text-muted text-xs">
        No recent activities logged in the last 30 days.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {activities.map((act) => (
        <div
          key={act.id}
          className="flex items-center justify-between p-4 rounded-xl border border-border-color bg-bg-surface/60 hover:bg-bg-surface transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${getBgColor(act.category)}`}>
              {getIcon(act.category, act.subcategory)}
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary capitalize">
                {act.subcategory.replace('_', ' ')}
              </span>
              <span className="text-xxs text-text-muted">
                {formatDate(act.timestamp)} • {act.value} {act.category === 'transport' ? 'km' : (act.category === 'energy' ? 'kWh' : 'servings')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold font-display text-text-primary">
              {formatCO2e(act.kg_co2e)}
            </span>
            {onDelete && (
              <button
                onClick={() => onDelete(act.id)}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-muted hover:text-danger-red hover:bg-danger-red/10 transition-all duration-200 cursor-pointer disabled:opacity-50"
                aria-label="Delete activity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default ActivityFeed;
