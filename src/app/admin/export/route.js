

// src/app/admin/subscribers/export/route.js
// Export all subscribers data as CSV/JSON

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request) {
  try {
    // Only ADMIN can export data
    await requireRole(["ADMIN"]);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const includeGroups = searchParams.get('includeGroups') === 'true';

    // Fetch all subscribers
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mobile: true,
        playerId: true,
        createdAt: true,
        updatedAt: true,
        ...(includeGroups && {
          groups: {
            select: {
              id: true,
              name: true,
            },
          },
        }),
      },
    });

    if (format === 'json') {
      return NextResponse.json({
        total: subscribers.length,
        exportDate: new Date().toISOString(),
        data: subscribers,
      });
    }

    // CSV format
    const headers = includeGroups 
      ? ['ID', 'Mobile', 'Player ID', 'Created Date', 'Groups']
      : ['ID', 'Mobile', 'Player ID', 'Created Date'];

    const csvRows = subscribers.map(sub => {
      const baseRow = [
        sub.id,
        sub.mobile || '',
        sub.playerId || '',
        sub.createdAt.toISOString().split('T')[0],
      ];

      if (includeGroups) {
        const groupNames = sub.groups?.map(g => g.name).join('; ') || '';
        baseRow.push(groupNames);
      }

      return baseRow.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="all_subscribers_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { message: 'Export failed' },
      { status: 500 }
    );
  }
}
