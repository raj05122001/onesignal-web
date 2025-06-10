// app/api/groups/[id]/route.js
//
// PATCH  /api/groups/[id]     → update meta / members
// DELETE /api/groups/[id]     → remove a group entirely
//
// PATCH Body (any subset)
// ──────────────────────────────────────────────────────────
// {
//   "name": "VIP Customers",                 // optional, unique
//   "description": "High-value users",       // optional
//   "subscriberIdsAdd":    ["sub-uuid1"],    // optional, connect
//   "subscriberIdsRemove": ["sub-uuid2"]     // optional, disconnect
// }
//
// Notes
// ──────────────────────────────────────────────────────────
// • Admin-only (requireRole(['ADMIN']))
// • Prevent deletion of “All Subscribers” default group
// ------------------------------------------------------------

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function notFound() {
  return NextResponse.json({ message: "Group not found" }, { status: 404 });
}

function forbidden(msg = "Forbidden") {
  return NextResponse.json({ message: msg }, { status: 403 });
}

/* ─────────────────────────────────────────
   PATCH  /api/groups/[id]
───────────────────────────────────────── */
export async function PATCH(request, { params }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = params;

    const {
      name,
      description,
      subscriberIdsAdd = [],
      subscriberIdsRemove = [],
    } = await request.json();

    // Validate name uniqueness if changed
    if (name) {
      const dup = await prisma.group.findFirst({
        where: { name, NOT: { id } },
        select: { id: true },
      });
      if (dup) {
        return NextResponse.json(
          { message: "Group name already exists" },
          { status: 409 },
        );
      }
    }

    // Build update payload
    const data = {};
    if (name) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();

    // Handle member mutations
    if (subscriberIdsAdd.length) {
      data.subscribers = {
        ...(data.subscribers || {}),
        connect: subscriberIdsAdd.map((sid) => ({ id: sid })),
      };
    }
    if (subscriberIdsRemove.length) {
      data.subscribers = {
        ...(data.subscribers || {}),
        disconnect: subscriberIdsRemove.map((sid) => ({ id: sid })),
      };
    }

    const updated = await prisma.group.update({
      where: { id },
      data,
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
      ...updated,
      memberCount: updated._count.subscribers,
    });
  } catch (err) {
    const msg = err?.message || "Update failed";
    if (msg === "Unauthorized") {
      return NextResponse.json({ message: msg }, { status: 401 });
    }
    if (msg.startsWith("Forbidden")) {
      return forbidden(msg);
    }
    console.error("PATCH /api/groups/[id] →", msg);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

/* ─────────────────────────────────────────
   DELETE  /api/groups/[id]
───────────────────────────────────────── */
export async function DELETE(request, { params }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = params;

    // Prevent deletion of the default group
    const group = await prisma.group.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!group) return notFound();
    if (group.name === "All Subscribers") {
      return forbidden("Default group cannot be deleted");
    }

    await prisma.group.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const msg = err?.message || "Delete failed";
    if (msg === "Unauthorized") {
      return NextResponse.json({ message: msg }, { status: 401 });
    }
    if (msg.startsWith("Forbidden")) {
      return forbidden(msg);
    }
    console.error("DELETE /api/groups/[id] →", msg);
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
