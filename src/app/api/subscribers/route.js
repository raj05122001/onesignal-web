// app/api/subscribers/route.js
//
// GET  /api/subscribers
//
// Query-params
// ───────────────────────────────────────────
//   page       (number, optional – default 1)
//   pageSize   (number, optional – default 100, max 1000)
//   search     (string,  optional – filters mobile or playerId contains)
//
// Response
// ───────────────────────────────────────────
// {
//   results:     [ { id, mobile, playerId, createdAt } ],
//   total:       123,
//   totalPages:  2,
//   page:        1,
//   pageSize:    100
// }
//
// Guard
// ───────────────────────────────────────────
// • Only ADMINs may call this route. It reuses `requireRole(['ADMIN'])`
//   from lib/auth.js.  Adjust as needed.
//
// --------------------------------------------------------------

import { NextResponse } from "next/server";
import prisma           from "@/lib/db";
import { requireRole }  from "@/lib/auth";

export async function GET(request) {
  try {
    /* 1) RBAC – must be ADMIN */
    await requireRole(["ADMIN"]);

    /* 2) Parse query-params */
    const { searchParams } = new URL(request.url);

    const page     = Math.max(1, parseInt(searchParams.get("page")      || "1",   10));
    const pageSize = Math.max(1,
                      Math.min(
                        1000,
                        parseInt(searchParams.get("pageSize") || "100", 10),
                      ));
    const search   = (searchParams.get("search") || "").trim();

    /* 3) Build Prisma filter */
    const where = search
      ? {
          OR: [
            { mobile:   { contains: search, mode: "insensitive" } },
            { playerId: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined;

    /* 4) Query database */
    const [ total, rows ] = await Promise.all([
      prisma.subscriber.count({ where }),
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id:        true,
          mobile:    true,
          playerId:  true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      results:     rows,
      total,
      totalPages:  Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    });
  } catch (err) {
    const msg = err?.message || "Internal server error";
    const code =
      msg === "Unauthorized"                        ? 401 :
      msg.startsWith("Forbidden")                  ? 403 :
                                                     500;

    return NextResponse.json({ message: msg }, { status: code });
  }
}
