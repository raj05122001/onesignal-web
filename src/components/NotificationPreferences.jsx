
// =================================================================

// src/components/NotificationPreferences.jsx
// Component for users to manage their notification preferences

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, BellOff, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getPlayerId } from '@/lib/onesignal-client';

export default function NotificationPreferences() {
  const [subscriber, setSubscriber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkSubscriberStatus();
  }, []);

  const checkSubscriberStatus = async () => {
    try {
      const playerId = await getPlayerId();
      if (!playerId) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/subscribers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      const result = await response.json();
      
      if (result.subscribed) {
        setSubscriber(result.subscriber);
      }
    } catch (error) {
      console.error('Error checking subscriber status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscriber) return;

    try {
      const playerId = await getPlayerId();
      const response = await fetch('/api/subscribers/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (response.ok) {
        setSubscriber(null);
        toast.success('Successfully unsubscribed');
      } else {
        toast.error('Failed to unsubscribe');
      }
    } catch (error) {
      toast.error('Error occurred while unsubscribing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
        Loading preferences...
      </div>
    );
  }

  if (!subscriber) {
    return null; // Not subscribed
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Settings size={14} />
        Notification Preferences
      </Button>

      {isOpen && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell size={16} />
            Your Subscription Details
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gray-400" />
              <span>Mobile: {subscriber.mobile}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span>Subscribed: {new Date(subscriber.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Groups:</p>
              <div className="flex flex-wrap gap-2">
                {subscriber.groups.map((group) => (
                  <Badge key={group.id} variant="secondary" className="text-xs">
                    {group.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleUnsubscribe}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <BellOff size={14} />
              Unsubscribe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}