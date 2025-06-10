// components/ui/badge.jsx
//
// Lightweight, Tailwind-styled <Badge/> component (shadcn-style)
// --------------------------------------------------------------
// • Variant-based colours:  default | secondary | destructive | outline
// • Size token (optional)  :  sm | md | lg
//
// Example
//   <Badge>NEW</Badge>
//   <Badge variant="secondary">Draft</Badge>
//   <Badge variant="destructive" size="sm">Error</Badge>
//
// Requires:
//   • Tailwind CSS with a `brand` colour in tailwind.config.js
//   • cn() helper (utils/classNames.js)
//
// --------------------------------------------------------------

"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/classNames";

/* ── design tokens ─────────────────────────────────────────── */
const variants = {
  default:     "bg-brand text-white",
  secondary:   "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
  destructive: "bg-red-600 text-white",
  outline:     "border border-input bg-transparent text-foreground",
};

const sizes = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

/* ── component ─────────────────────────────────────────────── */
export const Badge = forwardRef(
  (
    {
      className,
      variant = "default",
      size = "md",
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex select-none items-center rounded-full font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
