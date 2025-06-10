// app/api/users/route.js
//
// GET  /api/users              → paginated Subscribers list (ADMIN-only)
//
// Query params
// ────────────────────────────────────────────────
//   page      (default 1)
//   pageSize  (default 25)
//   search    (mobile number or playerId substring)
//
// Response JSON
// ────────────────────────────────────────────────
// {
//   results:      [ { id, mobile, playerId, createdAt } ],
//   total:        42,
//   totalPages:   2,
//   page:         1,
//   pageSize:     25
// }
//
// Notes
// ────────────────────────────────────────────────
// • Uses `requireRole(['ADMIN'])` guard (lib/auth.js)
// • Prisma model: Subscriber
// • Ordered by newest first
// • Returns 401 / 403 / 500 on error
// --------------------------------------------------------------

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(request) {
  try {
    // ─── 1) Auth guard ───────────────────────────
    await requireRole(["ADMIN"]);

    // ─── 2) Parse query params ───────────────────
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("pageSize") || "25", 10))
    );
    const search = searchParams.get("search")?.trim() || "";

    // ─── 3) Build Prisma filter ──────────────────
    const where = search
      ? {
          OR: [
            { mobile: { contains: search } },
            { playerId: { contains: search } },
          ],
        }
      : undefined;

    // ─── 4) Query DB ─────────────────────────────
    const [total, results] = await Promise.all([
      prisma.subscriber.count({ where }),
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          mobile: true,
          playerId: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      results,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      page,
      pageSize,
    });
  } catch (err) {
    // Auth errors bubble up as regular Errors – differentiate 401/403 by message
    const msg = err?.message || "Server error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ message: msg }, { status: 401 });
    }
    if (msg === "Forbidden – insufficient privileges") {
      return NextResponse.json({ message: msg }, { status: 403 });
    }
    console.error("GET /api/users →", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
