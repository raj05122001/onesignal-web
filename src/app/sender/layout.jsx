// app/sender/layout.jsx
//
// Shared layout for every “Sender” (and Admin-accessible) route.
// • Server Component – performs auth check on the server
// • Renders persistent <Sidebar/> and <Header/>
// • Guards against unauthenticated or wrong-role users
// ------------------------------------------------------------

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Notification Sender",
};

export default async function SenderLayout({ children }) {
  /* ─── 1) Session check ─────────────────────── */
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Only allow SENDER or ADMIN roles inside /sender/*
  if (!["SENDER", "ADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  /* ─── 2) Layout shell ───────────────────────── */
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (collapsible inside component) */}
      <Sidebar role={session.user.role} />

      {/* Right-side column */}
      <div className="flex flex-1 flex-col">
        {/* Global header */}
        <Header user={session.user} />

        {/* Route content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
