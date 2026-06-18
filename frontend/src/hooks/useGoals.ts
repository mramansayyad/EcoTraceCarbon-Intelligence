import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '../lib/api';
import { useUIStore } from '../store/uiStore';

export function useGoals() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await api.get('/goals');
      return res.data;
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: { targetReductionPct: number; durationWeeks: number; category: string }) => {
      const res = await api.post('/goals', goalData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      addToast('Reduction goal created successfully!', 'success');
    },
    onError: (err: AxiosError<{ error?: string }>) => {
      const errMsg = err.response?.data?.error || 'Failed to create goal';
      addToast(errMsg, 'error');
    }
  });

  const getGoalProgressQuery = (goalId: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery({
      queryKey: ['goals', goalId, 'progress'],
      queryFn: async () => {
        const res = await api.get(`/goals/${goalId}/progress`);
        return res.data;
      },
      enabled: !!goalId
    });
  };

  return {
    goals: (goalsQuery.data as unknown[]) || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal: createGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    getGoalProgressQuery
  };
}
