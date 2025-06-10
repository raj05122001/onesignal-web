// components/ui/button.jsx
//
// A lightweight, Tailwind-based <Button/> component inspired by
// shadcn/ui.  Variants & sizes are mapped to utility classes.
//
// Props
// ────────────────────────────────────────────────────────────
// • variant:  "default" | "secondary" | "destructive"
//             | "outline" | "ghost" | "link"
// • size:     "default" | "sm" | "lg" | "icon"
// • asChild:  renders the passed child element instead of <button>
//             (useful with Radix UI’s <Slot/>)
// • className: tail-wind overrides
//
// Example
// ────────────────────────────────────────────────────────────
//   <Button onClick={…}>Save</Button>
//   <Button variant="outline" size="sm">Cancel</Button>
//   <Button asChild>
//     <Link href="/">Home</Link>
//   </Button>
// ------------------------------------------------------------

"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils/classNames";

/* ───────────────────────────────────────────────────────────
   Design tokens
─────────────────────────────────────────────────────────── */
const base =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  default:     "bg-brand text-white hover:bg-brand/90",
  secondary:   "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  destructive: "bg-red-600 text-white hover:bg-red-600/90",
  outline:     "border border-input bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
  ghost:       "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
  link:        "text-brand underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm:      "h-8 px-3 text-xs",
  lg:      "h-11 px-8 text-base",
  icon:    "h-10 w-10",
};

/* ───────────────────────────────────────────────────────────
   Component
─────────────────────────────────────────────────────────── */
export const Button = forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
