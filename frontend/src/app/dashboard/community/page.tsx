'use client';

import React from 'react';
import { useCommunity } from '../../../hooks/useCommunity';
import { CommunityRankChart } from '../../../components/charts/CommunityRankChart';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Users, ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCO2e } from '../../../lib/formatters';

export default function CommunityPage() {
  const router = useRouter();
  const { communityData, isLoading, error } = useCommunity();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent-green mb-2" />
        <span className="text-xs text-text-muted font-medium">Loading community leaderboard statistics...</span>
      </div>
    );
  }

  if (error || !communityData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-white mb-2">Failed to Load Community Benchmarks</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
          Establish connection to server to pull real-time global comparisons.
        </p>
      </div>
    );
  }

  const { percentile, leaderboard, benchmarks } = communityData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-all font-semibold cursor-pointer mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-accent-green" />
            Community Benchmarks
          </h1>
          <p className="text-xs text-text-muted mt-1">
            See how your carbon tracking compares to regional averages and global leaderboard standings.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Percentile Status Card */}
        <Card variant="glow" className="flex flex-col justify-between p-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Community Standings</span>
            <div className="text-4xl font-extrabold text-white font-display mt-2">
              Top {100 - percentile}%
            </div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Your weekly carbon emissions are lower than <span className="text-accent-lime font-bold">{percentile}%</span> of EcoTrace members in your region.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-accent-lime font-bold">
            <Trophy className="h-4 w-4" />
            <span>Outperforming regional averages</span>
          </div>
        </Card>

        {/* Global Benchmark Averages Card */}
        <Card variant="base" className="p-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Weekly Averages</span>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Global Average</span>
              <span className="font-semibold text-white">{formatCO2e(benchmarks.globalWeeklyAvg)}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-zinc-800/60 pt-2">
              <span className="text-zinc-400">India Average</span>
              <span className="font-semibold text-white">{formatCO2e(benchmarks.indiaWeeklyAvg)}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-zinc-800/60 pt-2">
              <span className="text-zinc-400">1.5°C Climate Path Target</span>
              <span className="font-semibold text-emerald-400">{formatCO2e(benchmarks.carbonBudgetWeeklyTarget)}</span>
            </div>
          </div>
        </Card>

        {/* Leaderboard Chart (Visual Standing representation) */}
        <Card variant="base" className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Top Performers</span>
          <CommunityRankChart data={leaderboard} />
        </Card>
      </div>

      {/* Leaderboard Listing */}
      <Card variant="base">
        <CardHeader className="mb-4 border-b border-zinc-800/60 pb-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent-lime" />
            EcoTrace Leaderboard
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Anonymous ranking showing users with the lowest weekly carbon footprints.
          </p>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-400">
            <thead className="text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4 text-right">Weekly Footprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {leaderboard.map((entry: { rank: number; displayName: string; isCurrentUser: boolean; weekly_kg_co2e: number }) => (
                <tr
                  key={entry.rank}
                  className={`transition-colors ${
                    entry.isCurrentUser
                      ? 'bg-accent-green/5 text-accent-lime font-bold border-l-2 border-accent-lime'
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono">#{entry.rank}</td>
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span>{entry.displayName}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent-lime/10 text-accent-lime font-bold border border-accent-lime/20">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {formatCO2e(entry.weekly_kg_co2e)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
