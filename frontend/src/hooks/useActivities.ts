import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useUIStore } from '../store/uiStore';

export function useActivities() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await api.get('/activities');
      return res.data;
    }
  });

  const logActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const res = await api.post('/activities', activityData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Carbon activity logged successfully!', 'success');
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Failed to log activity';
      addToast(errMsg, 'error');
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const res = await api.delete(`/activities/${activityId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Activity log deleted.', 'info');
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Failed to delete activity';
      addToast(errMsg, 'error');
    }
  });

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    error: activitiesQuery.error,
    logActivity: logActivityMutation.mutateAsync,
    isLogging: logActivityMutation.isPending,
    deleteActivity: deleteActivityMutation.mutateAsync,
    isDeleting: deleteActivityMutation.isPending
  };
}
