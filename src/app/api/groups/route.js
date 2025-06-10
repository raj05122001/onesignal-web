// app/api/groups/route.js
//
// • GET   – List groups  (ADMIN + SENDER)
// • POST  – Create group (ADMIN-only)
//
// ------------------------------------------------------------
//   GET query params
//   ──────────────────────────────────────────────────────────
//     search      string  (optional, name contains …)
//
//   POST body
//   ──────────────────────────────────────────────────────────
//   {
//     "name":        "VIP Customers",      // required, unique
//     "description": "High-value users",   // optional
//     "subscriberIds": ["sub-uuid1", ...]  // optional, bulk-attach
//   }
//
//   Response (GET)
//   ──────────────────────────────────────────────────────────
//   [
//     { id, name, description, memberCount, createdAt, updatedAt }
//   ]
// ------------------------------------------------------------

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth";

/* ─────────────────────────────────────────
   GET  /api/groups
───────────────────────────────────────── */
export async function GET(request) {
  try {
    await requireRole(["ADMIN", "SENDER"]);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const groups = await prisma.group.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : {},
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { subscribers: true } },
      },
    });

    // Massage memberCount out of _count
    const data = groups.map((g) => ({
      ...g,
      memberCount: g._count.subscribers,
    }));

    return NextResponse.json(data);
  } catch (err) {
    const msg = err?.message || "Internal error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ message: msg }, { status: 401 });
    }
    if (msg.startsWith("Forbidden")) {
      return NextResponse.json({ message: msg }, { status: 403 });
    }
    console.error("GET /api/groups →", err);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

/* ─────────────────────────────────────────
   POST  /api/groups
───────────────────────────────────────── */
export async function POST(request) {
  try {
    await requireRole(["ADMIN"]);

    const { name, description = "", subscriberIds = [] } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Group name is required" },
        { status: 400 }
      );
    }

    // 1) Ensure unique name
    const exists = await prisma.group.findUnique({
      where: { name },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { message: "Group name already exists" },
        { status: 409 }
      );
    }

    // 2) Create group (and optionally attach subscribers)
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        subscribers: subscriberIds.length
          ? { connect: subscriberIds.map((id) => ({ id })) }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { subscribers: true } },
      },
    });

    return NextResponse.json({
      ...group,
      memberCount: group._count.subscribers,
    });
  } catch (err) {
    const msg = err?.message || "Create failed";
    if (msg === "Unauthorized") {
      return NextResponse.json({ message: msg }, { status: 401 });
    }
    if (msg.startsWith("Forbidden")) {
      return NextResponse.json({ message: msg }, { status: 403 });
    }
    console.error("POST /api/groups →", err);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
