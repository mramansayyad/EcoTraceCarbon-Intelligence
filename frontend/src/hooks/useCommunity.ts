import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useCommunity() {
  const communityQuery = useQuery({
    queryKey: ['community'],
    queryFn: async () => {
      const res = await api.get('/community');
      return res.data;
    }
  });

  return {
    communityData: communityQuery.data || null,
    isLoading: communityQuery.isLoading,
    error: communityQuery.error,
    refetch: communityQuery.refetch
  };
}
