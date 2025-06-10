// app/admin/subscribers/page.jsx
"use client";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import SubscriberTable from "@/components/SubscriberTable";
import { useSubscriberStats } from "@/hooks/useSubscribers";
import { Users, UserCheck, UserPlus, TrendingUp, Loader2 } from "lucide-react";

export default function SubscribersPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get real-time statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useSubscriberStats();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await auth();
        if (!sessionData?.user || sessionData.user.role !== "ADMIN") {
          redirect("/login");
        }
        setSession(sessionData);
      } catch (error) {
        console.error("Auth error:", error);
        redirect("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Subscribers Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monitor and manage your subscriber database with powerful bulk operations
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {statsError ? 'Offline' : 'Live'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={Users}
            title="Total Subscribers"
            value={statsLoading ? "..." : (stats?.totalSubscribers?.toLocaleString() || "0")}
            change={statsLoading ? "..." : stats?.monthlyGrowth || "+0%"}
            trend="up"
            color="blue"
            loading={statsLoading}
          />
          <StatsCard
            icon={UserPlus}
            title="New This Month"
            value={statsLoading ? "..." : (stats?.newThisMonth?.toLocaleString() || "0")}
            change={statsLoading ? "..." : stats?.monthlyGrowth || "+0%"}
            trend="up"
            color="green"
            loading={statsLoading}
          />
          <StatsCard
            icon={UserCheck}
            title="Active Users"
            value={statsLoading ? "..." : (stats?.activeSubscribers?.toLocaleString() || "0")}
            change={statsLoading ? "..." : stats?.activePercentage || "0%"}
            trend="up"
            color="purple"
            loading={statsLoading}
          />
          <StatsCard
            icon={TrendingUp}
            title="Growth Rate"
            value={statsLoading ? "..." : stats?.monthlyGrowth || "+0%"}
            change={statsLoading ? "..." : "+0%"}
            trend="up"
            color="orange"
            loading={statsLoading}
          />
        </div>

        {/* Error Banner */}
        {statsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              ⚠️ Unable to load statistics: {statsError.message}
            </p>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Subscriber Database
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Search, filter, and manage subscribers with bulk operations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Live</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <SubscriberTable />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component with loading state
function StatsCard({ icon: Icon, title, value, change, trend, color, loading }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8" />
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
        ) : (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        {loading ? (
          <>
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mb-2"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p className="text-sm opacity-80">{title}</p>
          </>
        )}
      </div>
    </div>
  );
}