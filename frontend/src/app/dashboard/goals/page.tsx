'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoalCreateSchema } from '../../../lib/validators';
import { useGoals } from '../../../hooks/useGoals';
import { GoalProgressChart } from '../../../components/charts/GoalProgressChart';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Target, Calendar, Award, Trash2, ArrowLeft, Loader2, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '../../../components/ui/Badge';

export default function GoalsPage() {
  const router = useRouter();
  const { goals, isLoading, createGoal, isCreating, getGoalProgressQuery } = useGoals();
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(GoalCreateSchema),
    defaultValues: {
      category: 'all',
      targetReductionPct: 10,
      durationWeeks: 4
    }
  });

  // Automatically select the first active goal on load
  useEffect(() => {
    if (goals.length > 0 && !selectedGoalId) {
      const activeGoal = goals.find((g: any) => g.status === 'active') || goals[0];
      setSelectedGoalId(activeGoal.id);
    }
  }, [goals, selectedGoalId]);

  // Fetch progress for selected goal
  const progressQuery = getGoalProgressQuery(selectedGoalId);
  const progressData = progressQuery.data || [];
  const isProgressLoading = progressQuery.isLoading;

  const onSubmit = async (data: any) => {
    try {
      const newGoal = await createGoal(data);
      if (newGoal && newGoal.id) {
        setSelectedGoalId(newGoal.id);
      }
      reset();
    } catch (e) {
      // toast shown in hook
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'transport': return '🚗';
      case 'food': return '🍲';
      case 'energy': return '⚡';
      case 'shopping': return '🛒';
      default: return '🌎';
    }
  };

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
            <Target className="h-6 w-6 text-accent-green" />
            Carbon Reduction Goals
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Commit to measurable targets and visualize your week-over-week progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Create Goal Form & Active Goals List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Create Goal Form */}
          <Card variant="base">
            <CardHeader className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="h-4 w-4 text-accent-green" />
                Set New Goal
              </h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Select
                  label="Category Scope"
                  options={[
                    { value: 'all', label: 'All Categories (Global)' },
                    { value: 'transport', label: '🚗 Transport only' },
                    { value: 'food', label: '🍲 Food & Meals only' },
                    { value: 'energy', label: '⚡ Home Energy only' },
                    { value: 'shopping', label: '🛒 Shopping only' }
                  ]}
                  error={errors.category?.message as string}
                  {...register('category')}
                />

                <Input
                  label="Target Reduction Percentage (%)"
                  type="number"
                  error={errors.targetReductionPct?.message as string}
                  placeholder="e.g. 15"
                  {...register('targetReductionPct')}
                />

                <Select
                  label="Goal Duration"
                  options={[
                    { value: '4', label: '4 Weeks' },
                    { value: '8', label: '8 Weeks' },
                    { value: '12', label: '12 Weeks' }
                  ]}
                  error={errors.durationWeeks?.message as string}
                  {...register('durationWeeks')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-2.5"
                  isLoading={isCreating}
                >
                  Create Goal Target
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Goals List */}
          <Card variant="base">
            <CardHeader className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                Goal History
              </h3>
            </CardHeader>
            <CardBody className="max-h-[300px] overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent-green" />
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-muted">
                  No goals set yet. Set your first goal above.
                </div>
              ) : (
                goals.map((g: any) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                      selectedGoalId === g.id
                        ? 'border-accent-green bg-accent-green/5'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{getCategoryEmoji(g.category)}</span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Reduce {g.targetReductionPct}% ({g.category})
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium">
                          {g.durationWeeks} weeks • Target: {g.targetWeekly.toFixed(1)} kg/wk
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={g.status === 'active' ? 'info' : g.status === 'completed' ? 'success' : 'danger'}
                      className="text-[9px] uppercase font-bold tracking-wider"
                    >
                      {g.status}
                    </Badge>
                  </button>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Side: Selected Goal Progress Visualization */}
        <div className="lg:col-span-2">
          {selectedGoalId ? (
            <Card variant="base" className="h-full">
              <CardHeader className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-accent-green" />
                    Weekly Performance Tracker
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                    Visualizing actual emissions vs budget target limit.
                  </p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col justify-center">
                {isProgressLoading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-accent-green mb-2" />
                    <span className="text-xs text-text-muted font-medium">Aggregating progress factors...</span>
                  </div>
                ) : progressData.length > 0 ? (
                  <div className="space-y-6">
                    <GoalProgressChart data={progressData} />
                    
                    {/* Progress details stats cards */}
                    <div className="grid grid-cols-3 gap-4 border-t border-zinc-800/80 pt-6">
                      <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Baseline</span>
                        <div className="text-lg font-bold text-white mt-1">
                          {goals.find((g: any) => g.id === selectedGoalId)?.baselineWeekly.toFixed(1)} kg
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Target Limit</span>
                        <div className="text-lg font-bold text-emerald-400 mt-1">
                          {goals.find((g: any) => g.id === selectedGoalId)?.targetWeekly.toFixed(1)} kg
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Current Week</span>
                        <div className="text-lg font-bold text-white mt-1">
                          {progressData[progressData.length - 1]?.actual.toFixed(1) || '0.0'} kg
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-xs text-text-muted">
                    No logs recorded during this goal interval.
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <Target className="h-10 w-10 text-zinc-650 mb-3" />
              <h4 className="text-sm font-bold text-zinc-400">No Goal Selected</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Select an active goal from the history panel or set a new reduction target scope.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
