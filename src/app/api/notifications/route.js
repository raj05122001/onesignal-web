// app/api/notifications/route.js
//
// • POST  → Send / schedule a new push notification
// • GET   → Paginated history list      (used by dashboards)
//
// NOTE
// ──────────────────────────────────────────────────────────
//   • Role-guard:  ADMIN  &  SENDER
//   • Uses OneSignal REST via lib/onesignal.js
//   • Persists each send in Prisma (NotificationLog)
// ----------------------------------------------------------

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole, auth } from "@/lib/auth";
import { sendNotification as oneSend } from "@/lib/onesignal";

/* ─────────────────────────────────────────
   POST  /api/notifications
   Body  {
     title:      string,
     message:    string,
     groups:     string[],   // group IDs  (≥1)
     url?:       string,
     imageUrl?:  string,
     scheduleAt?: string     // ISO, optional
   }
───────────────────────────────────────── */
export async function POST(req) {
  try {
    const session = await requireRole(["ADMIN", "SENDER"]);

    const {
      title,
      message,
      groups = [],
      url,
      imageUrl,
      scheduleAt,
    } = await req.json();

    if (!title || !message || !Array.isArray(groups) || groups.length === 0) {
      return NextResponse.json(
        { message: "title, message and ≥1 group are required" },
        { status: 400 }
      );
    }

    /* 1. Fetch target subscribers’ playerIds */
    const subs = await prisma.subscriber.findMany({
      where: { groups: { some: { id: { in: groups } } } },
      select: { playerId: true },
    });

    const playerIds = [...new Set(subs.map((s) => s.playerId).filter(Boolean))];
    if (playerIds.length === 0) {
      return NextResponse.json(
        { message: "Selected groups have no subscribers" },
        { status: 422 }
      );
    }

    /* 2. Call OneSignal */
    const scheduleDate = scheduleAt ? new Date(scheduleAt) : undefined;
    const osRes = await oneSend({
      title,
      message,
      playerIds,
      url,
      imageUrl,
      scheduleAt: scheduleDate,
    });

    /* 3. Persist NotificationLog */
    const log = await prisma.notificationLog.create({
      data: {
        title,
        message,
        url,
        imageUrl,
        scheduledAt: scheduleDate || null,
        sentAt: scheduleDate ? null : new Date(),
        status: scheduleDate ? "SCHEDULED" : "SENT",
        createdBy: { connect: { id: session.user.id } },
        groups: { connect: groups.map((id) => ({ id })) },
      },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        sentAt: true,
      },
    });

    return NextResponse.json({ log, oneSignalId: osRes.id });
  } catch (err) {
    const msg = err?.message || "Send failed";
    console.error("POST /api/notifications →", msg);
    if (msg === "Unauthorized") return NextResponse.json({ message: msg }, { status: 401 });
    if (msg.startsWith("Forbidden")) return NextResponse.json({ message: msg }, { status: 403 });
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

/* ─────────────────────────────────────────
   GET  /api/notifications   – paginated list
   Query ?page=1&pageSize=20&status=SENT&groupId=…&createdBy=…
───────────────────────────────────────── */
export async function GET(request) {
  try {
    await requireRole(["ADMIN", "SENDER"]);
    const { searchParams } = new URL(request.url);

    const page      = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize  = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "20", 10)));
    const status    = searchParams.get("status") || null;      // SENT | SCHEDULED | FAILED
    const groupId   = searchParams.get("groupId") || null;
    const createdBy = searchParams.get("createdBy") || null;

    /* Build Prisma filter */
    const where = {
      ...(status    ? { status } : {}),
      ...(createdBy ? { createdById: createdBy } : {}),
      ...(groupId   ? { groups: { some: { id: groupId } } } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.notificationLog.count({ where }),
      prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          message: true,
          status: true,
          scheduledAt: true,
          sentAt: true,
          delivered: true,
          failed: true,
          createdAt: true,
          groups: { select: { id: true, name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      results: rows,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      page,
      pageSize,
    });
  } catch (err) {
    const msg = err?.message || "Internal error";
    console.error("GET /api/notifications →", msg);
    if (msg === "Unauthorized") return NextResponse.json({ message: msg }, { status: 401 });
    if (msg.startsWith("Forbidden")) return NextResponse.json({ message: msg }, { status: 403 });
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
