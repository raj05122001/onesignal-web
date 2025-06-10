// components/NotificationForm.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useGroups } from "@/hooks/useGroups";
import { cn } from "@/utils/classNames"; 

/* ─────────────────────────────────────────
   1. Form schema (zod)
───────────────────────────────────────── */
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  scheduleAt: z.string().optional(),
  groups: z.array(z.string()).min(1, "Select at least one group"),
});

/* ─────────────────────────────────────────
   2. Main Component
───────────────────────────────────────── */
export default function NotificationForm() {
  /* Groups list */
  const { data: groups, isLoading } = useGroups();

  /* React-Hook-Form */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      message: "",
      url: "",
      imageUrl: "",
      scheduleAt: "",
      groups: [],
    },
  });

  /* Mutation → POST /api/notifications */
  const qc = useQueryClient();
  const { mutate, isLoading: isSending } = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Send failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Notification queued successfully");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      reset();
    },
    onError: (e) => toast.error(e.message),
  });

  /* Submit handler */
  const onSubmit = (data) => {
    mutate({
      ...data,
      scheduleAt: data.scheduleAt ? new Date(data.scheduleAt).toISOString() : null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-lg border bg-white p-6 shadow dark:bg-zinc-900"
    >
      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          type="text"
          placeholder="Enter title"
          {...register("title")}
          className={cn(
            "input w-full",
            errors.title && "border-red-500 focus:border-red-500"
          )}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="mb-1 block text-sm font-medium">Message</label>
        <textarea
          rows="4"
          placeholder="Enter message"
          {...register("message")}
          className={cn(
            "textarea w-full",
            errors.message && "border-red-500 focus:border-red-500"
          )}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {/* URL & Image URL */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Click URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            {...register("url")}
            className={cn(
              "input w-full",
              errors.url && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.url && (
            <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <input
            type="url"
            placeholder="https://example.com/cover.png"
            {...register("imageUrl")}
            className={cn(
              "input w-full",
              errors.imageUrl && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.imageUrl && (
            <p className="mt-1 text-xs text-red-500">
              {errors.imageUrl.message}
            </p>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Schedule (optional)
        </label>
        <input
          type="datetime-local"
          {...register("scheduleAt")}
          className="input w-full"
        />
      </div>

      {/* Groups */}
      <div>
        <label className="mb-1 block text-sm font-medium">Target Groups</label>
        <div className="flex flex-wrap gap-3 rounded border p-3">
          {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
          {!isLoading &&
            groups?.map((g) => (
              <label
                key={g.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="checkbox"
                  value={g.id}
                  {...register("groups")}
                  className="checkbox checkbox-sm"
                />
                <span>{g.name}</span>
              </label>
            ))}
        </div>
        {errors.groups && (
          <p className="mt-1 text-xs text-red-500">{errors.groups.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSending}
        className={cn(
          "btn btn-primary w-full",
          isSending && "cursor-not-allowed opacity-70"
        )}
      >
        {isSending ? "Sending…" : "Send Notification"}
      </button>
    </form>
  );
}
