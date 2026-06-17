'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface GoalProgressWeek {
  weekIndex: number;
  startDate: string;
  endDate: string;
  target: number;
  actual: number;
}

interface GoalProgressChartProps {
  data: GoalProgressWeek[];
}

export const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ data }) => {
  const chartData = data.map(w => ({
    name: `Week ${w.weekIndex}`,
    Target: w.target,
    Actual: w.actual
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2E22" vertical={false} />
          <XAxis dataKey="name" stroke="#4ADE80" fontSize={10} tickLine={false} />
          <YAxis stroke="#4ADE80" fontSize={10} tickLine={false} axisLine={false} unit=" kg" />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#111A14',
              borderColor: '#1F2E22',
              color: '#F0FDF4',
              borderRadius: '8px'
            }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar name="Weekly Target Limit" dataKey="Target" fill="#1F2E22" stroke="#10B981" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
          <Bar name="Your Actual Emissions" dataKey="Actual" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default GoalProgressChart;
