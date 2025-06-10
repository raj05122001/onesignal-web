// app/sender/new/page.jsx
//
// “Send Notification” screen
// ────────────────────────────────────────────────────────────
// • Server Component (runs on the server first)
// • Guards role (SENDER or ADMIN)
// • Renders <NotificationForm/> client-component
// ------------------------------------------------------------

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificationForm from "@/components/NotificationForm";

export const metadata = {
  title: "Send Notification",
};

export default async function NewNotificationPage() {
  /* ─── 1) Auth & role guard ─────────────────── */
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["SENDER", "ADMIN"].includes(session.user.role)) redirect("/");

  /* ─── 2) UI ─────────────────────────────────── */
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">
        Send Notification
      </h1>

      <NotificationForm />
    </section>
  );
}
