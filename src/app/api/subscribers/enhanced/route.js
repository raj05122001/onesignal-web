// src/app/api/subscribers/enhanced/route.js
// Enhanced Subscribers API with advanced filtering and analytics

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(request.url);
    
    // Enhanced query parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, Math.min(1000, parseInt(searchParams.get("pageSize") || "50", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const includeGroups = searchParams.get("includeGroups") === "true";
    const includeStats = searchParams.get("includeStats") === "true";

    // Build comprehensive filter
    let where = {};

    // Search filter
    if (search) {
      where.OR = [
        { mobile: { contains: search, mode: "insensitive" } },
        { playerId: { contains: search, mode: "insensitive" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    // Build select object
    const select = {
      id: true,
      mobile: true,
      playerId: true,
      createdAt: true,
      updatedAt: true,
    };

    if (includeGroups) {
      select.groups = {
        select: {
          id: true,
          name: true,
        },
      };
    }

    // Build sort object
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries
    const [total, subscribers] = await Promise.all([
      prisma.subscriber.count({ where }),
      prisma.subscriber.findMany({
        where,
        select,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    // Basic response
    const response = {
      results: subscribers,
      pagination: {
        total,
        totalPages: Math.ceil(total / pageSize),
        page,
        pageSize,
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      },
      filters: {
        search,
        sortBy,
        sortOrder,
        dateFrom,
        dateTo,
      },
    };

    // Add statistics if requested
    if (includeStats) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const [
        totalAllTime,
        newThisMonth,
        newThisWeek,
        withMobile,
        groupDistribution,
      ] = await Promise.all([
        // Total subscribers
        prisma.subscriber.count(),
        
        // New this month
        prisma.subscriber.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        
        // New this week
        prisma.subscriber.count({
          where: { createdAt: { gte: startOfWeek } },
        }),
        
        // Subscribers with mobile numbers
        prisma.subscriber.count({
          where: { mobile: { not: null } },
        }),
        
        // Group distribution
        prisma.group.findMany({
          select: {
            id: true,
            name: true,
            _count: {
              select: { subscribers: true },
            },
          },
        }),
      ]);

      response.statistics = {
        totalAllTime,
        newThisMonth,
        newThisWeek,
        withMobile,
        withoutMobile: totalAllTime - withMobile,
        mobilePercentage: totalAllTime > 0 ? ((withMobile / totalAllTime) * 100).toFixed(1) : 0,
        groupDistribution: groupDistribution.map(group => ({
          id: group.id,
          name: group.name,
          subscriberCount: group._count.subscribers,
        })),
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Enhanced subscribers API error:", error);
    
    const msg = error?.message || "Internal server error";
    const code = 
      msg === "Unauthorized" ? 401 :
      msg.startsWith("Forbidden") ? 403 :
      500;

    return NextResponse.json({ message: msg }, { status: code });
  }
}

// POST - Bulk operations on subscribers
export async function POST(request) {
  try {
    await requireRole(["ADMIN"]);

    const { action, subscriberIds, groupId } = await request.json();

    if (!action || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json(
        { message: "Action and subscriber IDs are required" },
        { status: 400 }
      );
    }

    let result = {};

    switch (action) {
      case 'addToGroup':
        if (!groupId) {
          return NextResponse.json(
            { message: "Group ID is required for addToGroup action" },
            { status: 400 }
          );
        }
        
        result = await prisma.subscriber.updateMany({
          where: { id: { in: subscriberIds } },
          data: {
            groups: {
              connect: { id: groupId },
            },
          },
        });
        break;

      case 'removeFromGroup':
        if (!groupId) {
          return NextResponse.json(
            { message: "Group ID is required for removeFromGroup action" },
            { status: 400 }
          );
        }
        
        result = await prisma.subscriber.updateMany({
          where: { id: { in: subscriberIds } },
          data: {
            groups: {
              disconnect: { id: groupId },
            },
          },
        });
        break;

      case 'delete':
        result = await prisma.subscriber.deleteMany({
          where: { id: { in: subscriberIds } },
        });
        break;

      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      affected: result.count || subscriberIds.length,
    });

  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      { message: "Bulk operation failed" },
      { status: 500 }
    );
  }
}
