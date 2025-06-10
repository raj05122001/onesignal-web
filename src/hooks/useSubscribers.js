// hooks/useSubscribers.js
//
// Admin-side helpers for fetching & managing Subscriber records.
// Built on TanStack Query v5 + "sonner" toasts.
// --------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/* ------------------------------------------------------------------
   1.  Generic fetch wrapper with better error handling
------------------------------------------------------------------- */
async function apiFetch(path, { method = 'GET', body, qs } = {}) {
  /* Build query-string if supplied */
  const url =
    qs && Object.keys(qs).length
      ? `${path}?${new URLSearchParams(qs)}`
      : path;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Subscribers API error (${res.status})`);
  }
  return res.json();
}

/* ------------------------------------------------------------------
   2.  Query → Paginated subscriber list
       Usage:
         const { data, isLoading, error } = useSubscribers({ page: 2, search: '9876' });
------------------------------------------------------------------- */
export function useSubscribers({ page = 1, pageSize = 25, search = '' } = {}) {
  return useQuery({
    queryKey: ['subscribers', page, pageSize, search],
    queryFn: () =>
      apiFetch('/api/subscribers', {
        qs: { page, pageSize, search },
      }),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      console.error('Subscribers fetch error:', error);
      toast.error('Failed to load subscribers');
    },
  });
}

/* ------------------------------------------------------------------
   3.  Query → Get subscriber statistics for dashboard
------------------------------------------------------------------- */
export function useSubscriberStats() {
  return useQuery({
    queryKey: ['subscriber-stats'],
    queryFn: () => apiFetch('/api/subscribers/stats'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Subscriber stats error:', error);
      toast.error('Failed to load statistics');
    },
  });
}

/* ------------------------------------------------------------------
   4.  Mutation → Bulk-add selected subscribers to a group
       Pass: { groupId, subscriberIds: [...] }
------------------------------------------------------------------- */
export function useAddSubscribersToGroup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, subscriberIds }) =>
      apiFetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        body: { subscriberIds },
      }),
    onSuccess: () => {
      toast.success('Subscribers added to group');
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['subscribers'] });
    },
    onError: (e) => toast.error(e.message),
  });
}

/* ------------------------------------------------------------------
   5.  Mutation → Remove subscriber completely (rarely used)
------------------------------------------------------------------- */
export function useDeleteSubscriber() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (subscriberId) =>
      apiFetch(`/api/subscribers/${subscriberId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Subscriber deleted');
      qc.invalidateQueries({ queryKey: ['subscribers'] });
      qc.invalidateQueries({ queryKey: ['subscriber-stats'] });
    },
    onError: (e) => toast.error(e.message),
  });
}