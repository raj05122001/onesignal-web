// src/hooks/useEnhancedSubscribers.js
// Enhanced hook with advanced features

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useEnhancedSubscribers(params = {}) {
  const {
    page = 1,
    pageSize = 50,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    dateFrom = '',
    dateTo = '',
    includeGroups = false,
    includeStats = false,
  } = params;

  return useQuery({
    queryKey: [
      'enhanced-subscribers',
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      includeGroups,
      includeStats,
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
        includeGroups: includeGroups.toString(),
        includeStats: includeStats.toString(),
        ...(search && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/subscribers/enhanced?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }
      
      return response.json();
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBulkSubscriberActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ action, subscriberIds, groupId }) => {
      const response = await fetch('/api/subscribers/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, subscriberIds, groupId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bulk action failed');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['enhanced-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscriber-stats'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}