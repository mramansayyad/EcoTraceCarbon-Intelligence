import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useInsights() {
  const insightsQuery = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await api.get('/ai/insights');
      return res.data;
    },
    staleTime: 5 * 60 * 1000 // Cache insights for 5 minutes
  });

  return {
    insight: insightsQuery.data?.insight || '',
    isLoading: insightsQuery.isLoading,
    error: insightsQuery.error,
    refetch: insightsQuery.refetch
  };
}
