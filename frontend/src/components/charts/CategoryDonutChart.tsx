'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';

interface CategoryItem {
  category: string;
  value: number;
  percentage: number;
}

interface CategoryDonutChartProps {
  data: CategoryItem[];
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data }) => {
  const COLORS = {
    transport: '#22C55E', // Green
    food: '#F59E0B',      // Amber
    energy: '#3B82F6',    // Blue
    shopping: '#8B5CF6'   // Purple
  };

  const chartData = data
    .filter(item => item.value > 0)
    .map(item => ({
      name: item.category.toUpperCase(),
      value: item.value,
      color: COLORS[item.category as keyof typeof COLORS] || '#10B981'
    }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center text-text-muted text-xs">
        <span>No emissions logged yet for this period.</span>
        <span>Log activities to see your breakdown.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#111A14',
              borderColor: '#1F2E22',
              color: '#F0FDF4',
              borderRadius: '8px'
            }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(val: any) => [`${Number(val).toFixed(1)} kg CO2e`]}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default CategoryDonutChart;
