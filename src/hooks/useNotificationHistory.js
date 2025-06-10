// hooks/useNotificationHistory.js
//
// Shared hook-set for Sender + Admin dashboards.
// Lists, filters, and mutates NotificationLog data
// via `/api/notifications` routes.
// --------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/* ─────────────────────────────────────────
   1. Generic fetch helper
───────────────────────────────────────── */
async function apiFetch(path, { method = 'GET', body, qs } = {}) {
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
    throw new Error(err?.message || `Notifications API error (${res.status})`);
  }
  return res.json();
}

/* ─────────────────────────────────────────
   2. Paginated list (history table)
   Example:
     const { data, isLoading } = useNotificationHistory({
       page: 1, pageSize: 20, status: 'SENT'
     });
───────────────────────────────────────── */
export function useNotificationHistory({
  page = 1,
  pageSize = 20,
  status = '',      // SENT | SCHEDULED | FAILED
  groupId = '',     // filter by Group
  createdBy = '',   // filter by userId (sender dashboard)
} = {}) {
  return useQuery({
    queryKey: [
      'notifications',
      page,
      pageSize,
      status,
      groupId,
      createdBy,
    ],
    queryFn: () =>
      apiFetch('/api/notifications', {
        qs: { page, pageSize, status, groupId, createdBy },
      }),
    keepPreviousData: true,
    staleTime: 60 * 1000, // 1 min
  });
}

/* ─────────────────────────────────────────
   3. Single notification detail
───────────────────────────────────────── */
export function useNotification(id) {
  return useQuery({
    enabled: !!id,
    queryKey: ['notification', id],
    queryFn: () => apiFetch(`/api/notifications/${id}`),
    staleTime: 5 * 60 * 1000,
  });
}

/* ─────────────────────────────────────────
   4. Cancel a scheduled notification
───────────────────────────────────────── */
export function useCancelNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiFetch(`/api/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Notification cancelled');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (e) => toast.error(e.message),
  });
}

/* ─────────────────────────────────────────
   5. Clone / resend helper (optional)
───────────────────────────────────────── */
export function useCloneNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, overrides = {} }) =>
      apiFetch(`/api/notifications/${id}/clone`, {
        method: 'POST',
        body: overrides,
      }),
    onSuccess: () => {
      toast.success('Notification enqueued');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (e) => toast.error(e.message),
  });
}
