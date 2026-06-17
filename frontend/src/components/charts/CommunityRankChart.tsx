'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

interface LeaderboardEntry {
  displayName: string;
  weekly_kg_co2e: number;
  rank: number;
  isCurrentUser: boolean;
}

interface CommunityRankChartProps {
  data: LeaderboardEntry[];
}

export const CommunityRankChart: React.FC<CommunityRankChartProps> = ({ data }) => {
  // Sort and select top 5 + user if user is not in top 5, or just top 7
  const chartData = data.slice(0, 7).map(item => ({
    name: item.displayName,
    Emissions: item.weekly_kg_co2e,
    isCurrentUser: item.isCurrentUser
  })).reverse(); // reverse for bottom-up horizontal bar layout

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <XAxis type="number" stroke="#4ADE80" fontSize={10} tickLine={false} unit=" kg" />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#4ADE80"
            fontSize={10}
            tickLine={false}
            width={90}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#111A14',
              borderColor: '#1F2E22',
              color: '#F0FDF4',
              borderRadius: '8px'
            }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(val: any) => [`${Number(val).toFixed(1)} kg CO2e/week`]}
          />
          <Bar dataKey="Emissions" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isCurrentUser ? '#A3E635' : '#22C55E'} // Lime highlight for current user
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default CommunityRankChart;
