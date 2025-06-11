

// src/components/SubscriberStatsWidget.jsx
// Widget for subscriber statistics

"use client";

import React from 'react';
import { useSubscriberStats } from '@/hooks/useSubscribers';
import { Users, TrendingUp, Calendar, Activity } from 'lucide-react';

export default function SubscriberStatsWidget() {
  const { data: stats, isLoading, error } = useSubscriberStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Subscribers',
      value: stats.totalSubscribers?.toLocaleString() || '0',
      icon: Users,
      color: 'blue',
      description: 'All time subscribers'
    },
    {
      title: 'New This Month',
      value: stats.newThisMonth?.toLocaleString() || '0',
      icon: TrendingUp,
      color: 'green',
      description: `Growth: ${stats.monthlyGrowth || '0%'}`
    },
    {
      title: 'Active Subscribers',
      value: stats.activeSubscribers?.toLocaleString() || '0',
      icon: Activity,
      color: 'purple',
      description: `${stats.activePercentage || '0%'} of total`
    },
    {
      title: 'Notifications Today',
      value: stats.notificationsSentToday?.toLocaleString() || '0',
      icon: Calendar,
      color: 'orange',
      description: 'Sent today'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}