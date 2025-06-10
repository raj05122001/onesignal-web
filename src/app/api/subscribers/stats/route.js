// app/api/subscribers/stats/route.js
//
// GET /api/subscribers/stats
//
// Returns real-time statistics for the admin dashboard
// ────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request) {
  try {
    // Auth guard - only ADMIN can access stats
    await requireRole(["ADMIN"]);

    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for efficiency
    const [
      totalSubscribers,
      newThisMonth,
      newLastMonth,
      totalGroups,
      activeSubscribers,
      notificationsSentToday,
    ] = await Promise.all([
      // Total subscribers
      prisma.subscriber.count(),
      
      // New subscribers this month
      prisma.subscriber.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      
      // New subscribers last month (for growth calculation)
      prisma.subscriber.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      
      // Total groups
      prisma.group.count(),
      
      // Active subscribers (those in at least one group)
      prisma.subscriber.count({
        where: {
          groups: {
            some: {},
          },
        },
      }),
      
      // Notifications sent today
      prisma.notificationLog.count({
        where: {
          sentAt: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const monthlyGrowth = newLastMonth > 0 
      ? ((newThisMonth - newLastMonth) / newLastMonth * 100).toFixed(1)
      : newThisMonth > 0 ? 100 : 0;

    const activePercentage = totalSubscribers > 0
      ? ((activeSubscribers / totalSubscribers) * 100).toFixed(1)
      : 0;

    // Return formatted statistics
    return NextResponse.json({
      totalSubscribers,
      newThisMonth,
      monthlyGrowth: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}%`,
      activeSubscribers,
      activePercentage: `${activePercentage}%`,
      totalGroups,
      notificationsSentToday,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Stats API error:', error);
    
    const msg = error?.message || "Internal server error";
    const code = 
      msg === "Unauthorized" ? 401 :
      msg.startsWith("Forbidden") ? 403 :
      500;

    return NextResponse.json({ message: msg }, { status: code });
  }
}