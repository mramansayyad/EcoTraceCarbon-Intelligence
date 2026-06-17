'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { useActivities } from '../../hooks/useActivities';
import { 
  Train, 
  Utensils, 
  Leaf, 
  Package, 
  Bus, 
  Tv 
} from 'lucide-react';
import { Button } from '../ui/Button';

export const QuickLogWidget: React.FC = () => {
  const { logActivity, isLogging } = useActivities();

  const quickItems = [
    {
      label: 'Train commute (15km)',
      icon: <Train className="h-4 w-4" />,
      payload: {
        category: 'transport',
        subcategory: 'train',
        value: 15,
        details: {},
        timestamp: new Date().toISOString()
      }
    },
    {
      label: 'Vegetarian meal',
      icon: <Utensils className="h-4 w-4 text-warn-amber" />,
      payload: {
        category: 'food',
        subcategory: 'vegetarian',
        value: 1,
        details: {},
        timestamp: new Date().toISOString()
      }
    },
    {
      label: 'Vegan meal',
      icon: <Leaf className="h-4 w-4 text-accent-green" />,
      payload: {
        category: 'food',
        subcategory: 'vegan',
        value: 1,
        details: {},
        timestamp: new Date().toISOString()
      }
    },
    {
      label: 'Online delivery',
      icon: <Package className="h-4 w-4" />,
      payload: {
        category: 'shopping',
        subcategory: 'online_delivery',
        value: 1,
        details: {},
        timestamp: new Date().toISOString()
      }
    },
    {
      label: 'Bus commute (5km)',
      icon: <Bus className="h-4 w-4" />,
      payload: {
        category: 'transport',
        subcategory: 'bus',
        value: 5,
        details: {},
        timestamp: new Date().toISOString()
      }
    },
    {
      label: 'Electricity (5 kWh)',
      icon: <Tv className="h-4 w-4" />,
      payload: {
        category: 'energy',
        subcategory: 'electricity',
        value: 5,
        details: { location: 'india' },
        timestamp: new Date().toISOString()
      }
    }
  ];

  const handleQuickLog = async (payload: any) => {
    try {
      await logActivity(payload);
    } catch (e) {
      // Handled inside hook
    }
  };

  return (
    <Card variant="base">
      <CardHeader className="mb-4">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          Quick Log Activities
        </h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-3">
          {quickItems.map((item, idx) => (
            <Button
              key={idx}
              variant="secondary"
              onClick={() => handleQuickLog(item.payload)}
              disabled={isLogging}
              className="flex items-center justify-start gap-2.5 px-3 py-3 rounded-xl hover:bg-bg-elevated transition-all border border-border-color/65 text-left h-12"
            >
              <div className="shrink-0 p-1.5 bg-bg-surface rounded-lg">
                {item.icon}
              </div>
              <span className="text-xxs font-semibold text-text-secondary truncate w-full">
                {item.label}
              </span>
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
export default QuickLogWidget;
