// app/admin/subscribers/page.jsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscriberTable from "@/components/SubscriberTable";
import { Users, UserCheck, UserPlus, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Subscribers Management | Admin Dashboard",
  description: "Manage and monitor subscriber database with bulk operations",
};

export default async function SubscribersPage() {
  /* ─── Auth & role guard ─────────────── */
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  /* ─── UI with enhanced design ─────────────── */
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={Users}
            title="Total Subscribers"
            value="12,456"
            change="+12%"
            trend="up"
            color="blue"
          />
          <StatsCard
            icon={UserPlus}
            title="New This Month"
            value="1,234"
            change="+8%"
            trend="up"
            color="green"
          />
          <StatsCard
            icon={UserCheck}
            title="Active Users"
            value="11,890"
            change="+5%"
            trend="up"
            color="purple"
          />
          <StatsCard
            icon={TrendingUp}
            title="Growth Rate"
            value="15.3%"
            change="+2.1%"
            trend="up"
            color="orange"
          />
        </div>

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

// Stats Card Component
function StatsCard({ icon: Icon, title, value, change, trend, color }) {
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
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-sm opacity-80">{title}</p>
      </div>
    </div>
  );
}
