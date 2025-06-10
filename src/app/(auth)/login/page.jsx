// app/(auth)/login/page.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/classNames";

/* ─────────────────────────────────────────
   Validation schema
───────────────────────────────────────── */
const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

/* ─────────────────────────────────────────
   Login Page
───────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const callbackUrl =
    useSearchParams().get("callbackUrl") || "/admin/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-6 rounded-lg border bg-white p-8 shadow dark:bg-zinc-900"
      >
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Sign in
        </h1>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={cn(errors.email && "border-red-500")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={cn(errors.password && "border-red-500")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full bg-blue-700 " disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
