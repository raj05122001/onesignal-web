// src/components/SubscribeButton.jsx
// Button component to trigger subscription

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { subscribeUser, getPermissionStatus } from '@/lib/onesignal-client';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const permission = await getPermissionStatus();
      
      if (permission === 'denied') {
        toast.error('Notifications are blocked. Please enable them in browser settings and refresh the page.');
        setLoading(false);
        return;
      }
      
      await subscribeUser();
      toast.success('Notification permission requested!');
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Subscribing...
        </>
      ) : (
        <>
          <Bell size={16} />
          Subscribe to Notifications
        </>
      )}
    </Button>
  );
}
