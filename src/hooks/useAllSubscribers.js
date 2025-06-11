
// src/hooks/useAllSubscribers.js
// Hook to fetch all subscribers without pagination

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAllSubscribers(enabled = true) {
  return useQuery({
    queryKey: ['all-subscribers'],
    queryFn: async () => {
      const response = await fetch('/api/subscribers?pageSize=1000'); // Large page size
      if (!response.ok) {
        throw new Error('Failed to fetch all subscribers');
      }
      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('All subscribers fetch error:', error);
      toast.error('Failed to load all subscribers');
    },
  });
}

// Hook for exporting data
export function useExportSubscribers() {
  const exportData = async (format = 'csv', includeGroups = false) => {
    try {
      const params = new URLSearchParams({
        format,
        includeGroups: includeGroups.toString(),
      });

      const response = await fetch(`/api/admin/subscribers/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        downloadBlob(blob, `subscribers_${new Date().toISOString().split('T')[0]}.json`);
      } else {
        const blob = await response.blob();
        downloadBlob(blob, `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      }

      toast.success(`Subscribers data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  return { exportData };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}