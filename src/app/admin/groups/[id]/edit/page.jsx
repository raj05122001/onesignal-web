"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";

/* Lazy-load the form */
const GroupEditForm = dynamic(() => import("@/components/GroupEditForm"), {
  ssr: false,
});

export default function EditGroupPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/groups/${id}`);
        if (res.status === 404) {
          router.replace("/not-found");
          return;
        }
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setGroup(data);
      } catch (error) {
        console.error("Failed to fetch group:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading form…
      </div>
    );
  }

  if (!group) return null;

  const subscriberIds = group.subscribers.map((s) => s.id);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">
        Edit Group – {group.name}
      </h1>

      <GroupEditForm
        id={group.id}
        initial={{
          name: group.name,
          description: group.description || "",
          subscriberIds,
          memberCount: group._count.subscribers,
        }}
      />
    </section>
  );
}
