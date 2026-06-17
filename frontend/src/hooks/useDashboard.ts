import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    }
  });

  return {
    dashboardData: dashboardQuery.data || null,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch
  };
}
