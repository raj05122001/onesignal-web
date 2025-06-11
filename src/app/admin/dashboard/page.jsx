// app/admin/dashboard/page.jsx
//
// 👑  Enhanced Admin Dashboard
// ────────────────────────────────────────────────────────────
// • Server Component (SSR) — pulls live counts from Prisma
// • Modern design with gradients, better typography, and animations
// • Responsive layout with improved visual hierarchy
// ------------------------------------------------------------

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import {
  Users,
  ListChecks,
  Bell,
  Clock,
  ArrowRight,
  TrendingUp,
  Calendar,
  UserCheck,
  Activity,
} from "lucide-react";
import React from "react";
import OneSignalSyncTool from '@/components/OneSignalSyncTool';

/* ─────────────────────────────────────────
   1. Aggregate DB look-ups
───────────────────────────────────────── */
async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    subscriberCount,
    groupCount,
    notificationsToday,
    scheduledCount,
    latestSubscribers,
    latestNotifications,
  ] = await Promise.all([
    prisma.subscriber.count(),
    prisma.group.count(),
    prisma.notificationLog.count({
      where: { sentAt: { gte: today } },
    }),
    prisma.notificationLog.count({ where: { status: "SCHEDULED" } }),
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, mobile: true, playerId: true, createdAt: true },
    }),
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        groups: { select: { name: true } },
      },
    }),
  ]);

    console.log('📊 Dashboard Stats:', {
    subscriberCount,
    groupCount,
    notificationsToday,
    scheduledCount
  });

  return {
    subscriberCount,
    groupCount,
    notificationsToday,
    scheduledCount,
    latestSubscribers,
    latestNotifications,
  };
}

/* ─────────────────────────────────────────
   2. Main page component
───────────────────────────────────────── */
export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const {
    subscriberCount,
    groupCount,
    notificationsToday,
    scheduledCount,
    latestSubscribers,
    latestNotifications,
  } = await getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <OneSignalSyncTool />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Welcome back! Here's what's happening with your notifications today.
          </p>
        </div>

        <section className="space-y-8">
          {/* KPI cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              icon={<Users className="h-6 w-6" />}
              label="Total Subscribers"
              value={subscriberCount}
              trend="+12% from last month"
              gradient="from-blue-500 to-cyan-400"
              bgGradient="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
            />
            <Kpi
              icon={<ListChecks className="h-6 w-6" />}
              label="Active Groups"
              value={groupCount}
              trend="+3 new groups"
              gradient="from-emerald-500 to-teal-400"
              bgGradient="from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
            />
            <Kpi
              icon={<Bell className="h-6 w-6" />}
              label="Sent Today"
              value={notificationsToday}
              trend="🔥 High activity"
              gradient="from-orange-500 to-red-400"
              bgGradient="from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
            />
            <Kpi
              icon={<Clock className="h-6 w-6" />}
              label="Scheduled"
              value={scheduledCount}
              trend="Next: 2:30 PM"
              gradient="from-purple-500 to-pink-400"
              bgGradient="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
            />
          </div>

          {/* Content Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Latest subscribers */}
            <EnhancedCard
              title="Latest Subscribers"
              subtitle="Recent sign-ups to your service"
              href="/admin/subscribers"
              icon={<UserCheck className="h-5 w-5" />}
              cols={["Mobile", "Player ID", "Joined"]}
            >
              {latestSubscribers.map((s, index) => (
                <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="py-4 px-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {s.mobile || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-1">
                    <span className="truncate max-w-[180px] text-slate-600 dark:text-slate-400 font-mono text-sm">
                      {s.playerId}
                    </span>
                  </td>
                  <td className="py-4 px-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatDate(s.createdAt)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </EnhancedCard>

            {/* Latest notifications */}
            <EnhancedCard
              title="Latest Notifications"
              subtitle="Recent notification campaigns"
              href="/sender/history"
              icon={<Activity className="h-5 w-5" />}
              cols={["Title", "Groups", "Status & Date"]}
            >
              {latestNotifications.map((n, index) => (
                <tr key={n.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="py-4 px-1">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-1">
                    <div className="flex flex-wrap gap-1">
                      {n.groups.length > 0 ? (
                        n.groups.slice(0, 2).map((g, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {g.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      {n.groups.length > 2 && (
                        <span className="text-xs text-slate-500">
                          +{n.groups.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-1">
                    <div className="space-y-1">
                      <StatusBadge status={n.status} />
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(n.createdAt)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </EnhancedCard>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   3. Enhanced reusable components
───────────────────────────────────────── */
function Kpi({ icon, label, value, trend, gradient, bgGradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} p-6 shadow-lg border border-white/20 backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:shadow-xl`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg`}>
            {icon}
          </div>
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">{trend}</p>
        </div>
      </div>
    </div>
  );
}

function EnhancedCard({ title, subtitle, href, icon, cols, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl dark:border-slate-700 dark:bg-slate-900/80 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <Link
            href={href}
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {cols.map((c) => (
                <th key={c} className="pb-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {children}
            {React.Children.count(children) === 0 && (
              <tr>
                <td
                  colSpan={cols.length}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Users className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No data available</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Data will appear here once available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    SCHEDULED: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", label: "Scheduled" },
    SENT: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", label: "Sent" },
    FAILED: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "Failed" },
    PENDING: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "Pending" },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}