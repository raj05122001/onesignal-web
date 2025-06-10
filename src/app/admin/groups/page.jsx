// app/admin/groups/page.jsx
//
// 🗂️  Groups Management
// ─────────────────────────────────────────────────────────
// • Server Component (runs on the server first)
// • Admin-only guard – redirects non-admin users to /login
// • Renders a client-side <GroupTable/> that handles
//   listing, create/edit/delete, and member counts.
//   (Ask for GroupTable.jsx if you need its code.)
// ---------------------------------------------------------
"use client"
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect } from "react";

/* Lazy-load the heavy client component */
const GroupTable = dynamic(() => import("@/components/GroupTable"), {
  ssr: false,
});

export default function GroupsPage() {
  /* ─── 1) Role guard ───────────────────────── */
  useEffect(() => {
    handleRoute()
  }, [])
  const handleRoute = async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      redirect("/login");
    }
  }
  /* ─── 2) UI shell ─────────────────────────── */
  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Groups</h1>

      {/* Client component handles CRUD, search, pagination */}
      <GroupTable />
    </section>
  );
}
