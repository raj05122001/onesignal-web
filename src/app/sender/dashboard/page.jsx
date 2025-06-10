// app/sender/dashboard/page.jsx
//
// “Sender” landing dashboard
// ────────────────────────────────────────────────────────────
// • Server Component  – runs entirely on the server
// • Shows high-level KPIs + last-5 notifications table
// • Works for both SENDER and ADMIN roles
// ------------------------------------------------------------

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";

/* ─────────────────────────────────────────
   Helper → DB queries
───────────────────────────────────────── */
async function getStats(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const commonFilter = userId ? { createdById: userId } : {};

  const [sentToday, scheduled, failed, recent] = await Promise.all([
    prisma.notificationLog.count({
      where: { ...commonFilter, sentAt: { gte: today } },
    }),
    prisma.notificationLog.count({
      where: { ...commonFilter, status: "SCHEDULED" },
    }),
    prisma.notificationLog.count({
      where: { ...commonFilter, status: "FAILED" },
    }),
    prisma.notificationLog.findMany({
      where: commonFilter,
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

  return { sentToday, scheduled, failed, recent };
}

/* ─────────────────────────────────────────
   Page Component
───────────────────────────────────────── */
export default async function SenderDashboardPage() {
  const session = await auth();
  const userId =
    session?.user.role === "SENDER" ? session.user.id : undefined;

  const { sentToday, scheduled, failed, recent } = await getStats(userId);

  /* UI ───────────────────────────────────── */
  return (
    <section className="space-y-8">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Sent Today" value={sentToday} />
        <KpiCard label="Scheduled" value={scheduled} />
        <KpiCard label="Failed" value={failed} />
      </div>

      {/* Recent notifications */}
      <div className="rounded-lg border bg-white p-4 shadow dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold">Recent Notifications</h2>
          <Link
            href="/sender/history"
            className="flex items-center gap-1 text-sm text-brand hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2">Title</th>
              <th className="py-2">Status</th>
              <th className="py-2">Groups</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((n) => (
              <tr key={n.id} className="border-t">
                <td className="py-2 font-medium">{n.title}</td>
                <td className="py-2">
                  <StatusBadge status={n.status} />
                </td>
                <td className="py-2">
                  {n.groups.map((g) => g.name).join(", ") || "—"}
                </td>
                <td className="py-2">{formatDate(n.createdAt)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-muted-foreground"
                >
                  No notifications yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Re-usable tiny components
───────────────────────────────────────── */
function KpiCard({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-zinc-900">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    SENT: {
      text: "Sent",
      class: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    },
    SCHEDULED: {
      text: "Scheduled",
      class:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    },
    FAILED: {
      text: "Failed",
      class: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    },
  };
  const cfg = map[status] || {
    text: status,
    class: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.class}`}
    >
      {status === "SCHEDULED" && (
        <LoaderCircle className="h-3 w-3 animate-spin" />
      )}
      {cfg.text}
    </span>
  );
}
