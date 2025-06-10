
// =================================================================

// src/components/SubscriptionStatus.jsx
// Component to show current subscription status

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isSubscribed, getPermissionStatus, unsubscribeUser, getPlayerId } from '@/lib/onesignal-client';
import { Bell, BellOff, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionStatus() {
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState('unknown');
  const [playerId, setPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [subStatus, permStatus, pId] = await Promise.all([
          isSubscribed(),
          getPermissionStatus(),
          getPlayerId()
        ]);
        
        setSubscribed(subStatus);
        setPermission(permStatus);
        setPlayerId(pId);
      } catch (error) {
        console.error('Error checking status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check status after a small delay to ensure OneSignal is initialized
    const timer = setTimeout(checkStatus, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeUser();
      setSubscribed(false);
      toast.success('Successfully unsubscribed from notifications');
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
        Checking subscription status...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge variant={subscribed ? "default" : "secondary"} className="flex items-center gap-1">
          {subscribed ? <Bell size={12} /> : <BellOff size={12} />}
          {subscribed ? 'Subscribed' : 'Not Subscribed'}
        </Badge>
        
        <Badge variant="outline" className="text-xs">
          Permission: {permission}
        </Badge>
      </div>

      {playerId && (
        <div className="text-xs text-gray-500 font-mono">
          Player ID: {playerId.slice(0, 8)}...
        </div>
      )}

      {subscribed && (
        <Button
          onClick={handleUnsubscribe}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings size={14} />
          Unsubscribe
        </Button>
      )}
    </div>
  );
}