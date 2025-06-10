'use client';

import SubscribeButton from '@/components/SubscribeButton';
import SubscriptionStatus from '@/components/SubscriptionStatus';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
          
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stay Updated
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300">
            Get instant notifications about important updates and announcements
          </p>
          
          <SubscribeButton />
          
          <SubscriptionStatus />
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can unsubscribe at any time
          </p>
          
        </div>
      </div>
    </div>
  );
}