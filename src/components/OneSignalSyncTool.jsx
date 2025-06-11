// src/components/OneSignalSyncTool.jsx
// Admin component to sync OneSignal data

"use client";

import React, { useState } from 'react';
import { RefreshCw, Download, AlertTriangle, CheckCircle, Users, Zap } from 'lucide-react';

export default function OneSignalSyncTool() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Check sync status
  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/sync-onesignal');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  };

  // Run sync
  const runSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/sync-onesignal', {
        method: 'POST',
      });
      
      const result = await response.json();
      setLastSyncResult(result);
      
      if (result.success) {
        // Refresh sync status
        await checkSyncStatus();
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setLastSyncResult({
        success: false,
        message: 'Sync failed: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check status on component mount
  React.useEffect(() => {
    checkSyncStatus();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Zap className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">OneSignal Data Sync</h3>
          <p className="text-sm text-gray-600">Sync OneSignal subscribers with local database</p>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">OneSignal</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{syncStatus.oneSignalSubscribers}</p>
            <p className="text-xs text-blue-700">Total subscribers</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Local Database</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{syncStatus.localSubscribers}</p>
            <p className="text-xs text-green-700">Local subscribers</p>
          </div>

          <div className={`p-4 rounded-lg ${syncStatus.syncNeeded ? 'bg-orange-50' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {syncStatus.syncNeeded ? (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span className={`text-sm font-medium ${syncStatus.syncNeeded ? 'text-orange-800' : 'text-green-800'}`}>
                Sync Status
              </span>
            </div>
            <p className={`text-2xl font-bold ${syncStatus.syncNeeded ? 'text-orange-900' : 'text-green-900'}`}>
              {syncStatus.syncNeeded ? 'Out of Sync' : 'In Sync'}
            </p>
            <p className={`text-xs ${syncStatus.syncNeeded ? 'text-orange-700' : 'text-green-700'}`}>
              {syncStatus.syncNeeded ? 'Sync required' : 'All synced'}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={checkSyncStatus}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Check Status
        </button>

        <button
          onClick={runSync}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          {isLoading ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Last Sync Result */}
      {lastSyncResult && (
        <div className={`p-4 rounded-lg border ${lastSyncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {lastSyncResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <span className={`font-medium ${lastSyncResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {lastSyncResult.success ? 'Sync Successful' : 'Sync Failed'}
            </span>
          </div>
          
          <p className={`text-sm mb-3 ${lastSyncResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {lastSyncResult.message}
          </p>

          {lastSyncResult.success && lastSyncResult.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="font-medium text-green-800">Created</p>
                <p className="text-green-700">{lastSyncResult.summary.localCreated}</p>
              </div>
              <div>
                <p className="font-medium text-green-800">Updated</p>
                <p className="text-green-700">{lastSyncResult.summary.localUpdated}</p>
              </div>
              <div>
                <p className="font-medium text-green-800">Errors</p>
                <p className="text-green-700">{lastSyncResult.summary.errors}</p>
              </div>
              <div>
                <p className="font-medium text-green-800">Total Local</p>
                <p className="text-green-700">{lastSyncResult.summary.totalLocalSubscribers}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Fetches all subscribers from OneSignal API</li>
          <li>• Creates missing subscribers in local database</li>
          <li>• Updates existing subscribers with latest data</li>
          <li>• Adds all subscribers to "All Subscribers" group</li>
        </ul>
      </div>
    </div>
  );
}