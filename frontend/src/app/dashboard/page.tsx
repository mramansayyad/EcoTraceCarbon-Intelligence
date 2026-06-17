'use client';

import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useActivities } from '../../hooks/useActivities';
import { useAuthStore } from '../../store/authStore';
import { FootprintSummaryCard } from '../../components/dashboard/FootprintSummaryCard';
import { CarbonStreakBadge } from '../../components/dashboard/CarbonStreakBadge';
import { CarbonPulseIndicator } from '../../components/dashboard/CarbonPulseIndicator';
import { AIInsightBanner } from '../../components/dashboard/AIInsightBanner';
import { QuickLogWidget } from '../../components/dashboard/QuickLogWidget';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { FootprintTrendChart } from '../../components/charts/FootprintTrendChart';
import { CategoryDonutChart } from '../../components/charts/CategoryDonutChart';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Leaf, RefreshCw, Zap, Flame, Users, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { dashboardData, isLoading, error, refetch } = useDashboard();
  const { deleteActivity, isDeleting } = useActivities();
  const { profile } = useAuthStore();

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full lg:col-span-1" />
          <Skeleton className="h-80 w-full lg:col-span-1" />
          <Skeleton className="h-80 w-full lg:col-span-1" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-full bg-rose-950/20 text-rose-500 border border-rose-800 mb-4">
          <Leaf className="h-10 w-10 rotate-180" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to load Carbon Dashboard</h2>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">
          Could not establish connection to the EcoTrace server. Please check your network and try again.
        </p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Reconnecting</span>
        </button>
      </div>
    );
  }

  const { stats, charts, recentActivities } = dashboardData;
  const targetValue = profile?.weeklyTarget || 44.0;

  return (
    <div className="space-y-6">
      {/* Header Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
            Carbon Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time carbon tracking, insights, and eco-habits.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync Live Data</span>
        </button>
      </div>

      {/* Top row: FootprintSummaryCards & Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FootprintSummaryCard
          title="Today's Footprint"
          value={stats.today.value}
          type="carbon"
          delta={stats.today.deltaPct}
          deltaLabel="vs yesterday"
          icon={<Calendar className="h-4 w-4 text-emerald-400" />}
        />
        <FootprintSummaryCard
          title="This Week's Total"
          value={stats.week.value}
          type="carbon"
          delta={stats.week.deltaPct}
          deltaLabel="vs last week"
          icon={<Leaf className="h-4 w-4 text-emerald-400" />}
        />
        <FootprintSummaryCard
          title="This Month's Total"
          value={stats.month.value}
          type="carbon"
          delta={stats.month.vsNationalAvgPct}
          deltaLabel="vs National average"
          icon={<Users className="h-4 w-4 text-emerald-400" />}
        />
        <CarbonStreakBadge streakDays={stats.streak.days} />
      </div>

      {/* Main Grid: Pulse Indicator, Category breakdown, Quick log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carbon Pulse Ring */}
        <div className="lg:col-span-1">
          <CarbonPulseIndicator
            weeklyValue={stats.week.value}
            weeklyTarget={targetValue}
          />
        </div>

        {/* Category Breakdown Donut */}
        <div className="lg:col-span-1">
          <Card variant="base" className="h-full">
            <CardHeader className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Category Breakdown</h3>
            </CardHeader>
            <CardBody className="flex items-center justify-center">
              <CategoryDonutChart data={charts.categories} />
            </CardBody>
          </Card>
        </div>

        {/* Quick Log widget */}
        <div className="lg:col-span-1">
          <QuickLogWidget />
        </div>
      </div>

      {/* AI banner */}
      <AIInsightBanner />

      {/* Bottom Grid: Trend and recent activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Footprint Trend Line Chart */}
        <div className="lg:col-span-2">
          <Card variant="base">
            <CardHeader className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight">30-Day Carbon Trend</h3>
            </CardHeader>
            <CardBody>
              <FootprintTrendChart data={charts.trend} />
            </CardBody>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <Card variant="base" className="h-full">
            <CardHeader className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity Log</h3>
            </CardHeader>
            <CardBody className="max-h-[300px] overflow-y-auto">
              <ActivityFeed
                activities={recentActivities}
                onDelete={deleteActivity}
                isDeleting={isDeleting}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
