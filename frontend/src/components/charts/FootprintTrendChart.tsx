'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TrendItem {
  date: string;
  value: number;
  rollingAvg: number;
}

interface FootprintTrendChartProps {
  data: TrendItem[];
}

export const FootprintTrendChart: React.FC<FootprintTrendChartProps> = ({ data }) => {
  // Format dates for display (e.g. YYYY-MM-DD to "Jun 15")
  const formattedData = data.map(item => {
    const parts = item.date.split('-');
    if (parts.length === 3) {
      const p0 = parts[0] ?? '0';
      const p1 = parts[1] ?? '1';
      const p2 = parts[2] ?? '1';
      const date = new Date(parseInt(p0, 10), parseInt(p1, 10) - 1, parseInt(p2, 10));
      return {
        ...item,
        dateFormatted: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    }
    return { ...item, dateFormatted: item.date };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2E22" vertical={false} />
          <XAxis 
            dataKey="dateFormatted" 
            stroke="#4ADE80" 
            fontSize={10}
            tickLine={false} 
          />
          <YAxis 
            stroke="#4ADE80" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            unit=" kg"
          />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: '#111A14', 
              borderColor: '#1F2E22',
              color: '#F0FDF4',
              borderRadius: '8px'
            }} 
            labelClassName="font-bold text-xs"
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Line
            name="Daily Emissions"
            type="monotone"
            dataKey="value"
            stroke="#22C55E"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            name="7-day Rolling Avg"
            type="monotone"
            dataKey="rollingAvg"
            stroke="#10B981"
            strokeWidth={2.0}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default FootprintTrendChart;
