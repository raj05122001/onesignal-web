// app/admin/layout.jsx
//
// Shared layout for every route under /admin
// • Guards so only ADMIN users can access
// • Renders persistent <Sidebar/> + <Header/>
// • Server Component (auth check runs on the server)
// --------------------------------------------------

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Panel",
};

export default async function AdminLayout({ children }) {
  /* ─── 1) Auth & role guard ─────────────── */
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  /* ─── 2) Shell ─────────────────────────── */
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (ADMIN navigation) */}
      <Sidebar role="ADMIN" />

      {/* Right side */}
      <div className="flex flex-1 flex-col">
        <Header user={session.user} />

        {/* Routed pages render here */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
