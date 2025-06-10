// components/ui/popover.jsx
//
// Lightweight wrapper around @radix-ui/react-popover that
// applies Tailwind styles (shadcn/ui-style).
//
// Exports
// ─────────────────────────────────────────────
//  • Popover
//  • PopoverTrigger
//  • PopoverContent
//
// Example
// ─────────────────────────────────────────────
// <Popover>
//   <PopoverTrigger asChild>
//     <Button variant="outline">Open</Button>
//   </PopoverTrigger>
//
//   <PopoverContent className="w-64">
//     Any JSX here…
//   </PopoverContent>
// </Popover>
//
// Dependencies
//   npm i @radix-ui/react-popover
// ------------------------------------------------------------

"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/utils/classNames";

/* Root component (no styling needed) */
export const Popover = PopoverPrimitive.Root;

/* Trigger */
export const PopoverTrigger = PopoverPrimitive.Trigger;

/* Styled content panel */
export const PopoverContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md border bg-white p-4 text-sm shadow-md " +
          "animate-in fade-in zoom-in-95 data-[state=closed]:animate-out " +
          "data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 " +
          "dark:bg-zinc-900 dark:border-zinc-700",
        className
      )}
      {...props}
    />
  )
);
PopoverContent.displayName = "PopoverContent";
