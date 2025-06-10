// hooks/useGroups.js
//
// React hook wrappers around the Groups API.
// Relies on TanStack Query v5 for caching + mutations.
// ----------------------------------------------------

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/* ─────────────────────────────────────────
   1. API helpers
───────────────────────────────────────── */
async function apiFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/groups${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Groups API error (${res.status})`);
  }
  return res.json();
}

/* ─────────────────────────────────────────
   2. Query: list groups
───────────────────────────────────────── */
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiFetch(''),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

/* ─────────────────────────────────────────
   3. Mutations
───────────────────────────────────────── */
export function useCreateGroup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiFetch('', { method: 'POST', body: payload }),
    onSuccess: () => {
      toast.success('Group created');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiFetch(`/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      toast.success('Group updated');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiFetch(`/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Group deleted');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (e) => toast.error(e.message),
  });
}
