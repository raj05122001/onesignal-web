// components/ui/input.jsx
//
// Minimal, tailwind-styled <Input/> component (shadcn-style)
// ----------------------------------------------------------
// • Works for <input type="text|email|password|url|…">
// • For multi-line text use <textarea> instead
//
// Example
//   <Input placeholder="Your email" />
//   <Input type="password" className="mt-2" />
//
// Requires:
//   • Tailwind CSS
//   • `brand` color in tailwind.config.js (for focus ring)
//   • cn() helper  (utils/classNames.js)
// ----------------------------------------------------------

"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/classNames";

export const Input = forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm " +
            "placeholder:text-muted-foreground focus-visible:outline-none " +
            "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 " +
            "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
