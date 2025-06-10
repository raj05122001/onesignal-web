// components/ui/dropdown-menu.jsx
//
// Radix Dropdown Menu wrapped with Tailwind classes (shadcn-style)
// ────────────────────────────────────────────────────────────────
// Exports
//   • DropdownMenu           (Root)
//   • DropdownMenuTrigger    (Trigger)
//   • DropdownMenuContent    (Panel)
//   • DropdownMenuItem
//   • DropdownMenuSeparator
//   • DropdownMenuLabel
//   • DropdownMenuGroup
//   • DropdownMenuPortal
//
// Usage
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild>
//       <Button variant="ghost">Options</Button>
//     </DropdownMenuTrigger>
//
//     <DropdownMenuContent align="end">
//       <DropdownMenuItem onSelect={…}>Profile</DropdownMenuItem>
//       <DropdownMenuItem disabled>Billing</DropdownMenuItem>
//       <DropdownMenuSeparator />
//       <DropdownMenuItem onSelect={signOut}>Logout</DropdownMenuItem>
//     </DropdownMenuContent>
//   </DropdownMenu>
//
// Dependencies
//   npm i @radix-ui/react-dropdown-menu
// ────────────────────────────────────────────────────────────────

"use client";

import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/utils/classNames";

/* Root exports straight from Radix */
export const DropdownMenu        = DropdownPrimitive.Root;
export const DropdownMenuPortal  = DropdownPrimitive.Portal;
export const DropdownMenuGroup   = DropdownPrimitive.Group;
export const DropdownMenuLabel   = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <DropdownPrimitive.Label
      ref={ref}
      {...props}
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
        inset && "pl-8",
        className
      )}
    />
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownPrimitive.Separator
      ref={ref}
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

/* Trigger (no styling) */
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

/* Content panel */
export const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 " +
            "text-sm shadow-md animate-in fade-in zoom-in-90 " +
            "data-[side=bottom]:slide-in-from-top-1 " +
            "data-[side=top]:slide-in-from-bottom-1 " +
            "dark:bg-zinc-900 dark:border-zinc-700",
          className
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  )
);
DropdownMenuContent.displayName = "DropdownMenuContent";

/* Item */
export const DropdownMenuItem = React.forwardRef(
  (
    { className, inset, disabled, onSelect, ...props },
    ref
  ) => (
    <DropdownPrimitive.Item
      ref={ref}
      disabled={disabled}
      onSelect={disabled ? undefined : onSelect}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 " +
          "outline-none transition-colors data-[disabled]:pointer-events-none " +
          "data-[disabled]:opacity-50 focus:bg-zinc-100 focus:text-zinc-900 " +
          "dark:focus:bg-zinc-800 dark:focus:text-zinc-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";
