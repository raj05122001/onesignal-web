// components/ui/command.jsx
//
// Radix “Command” (command-palette style) with Tailwind styling
// ───────────────────────────────────────────────────────────────
// Exports
//   • Command              (Root)
//   • CommandList          (scrollable list wrapper)
//   • CommandInput         (search box)
//   • CommandGroup         (label + items)
//   • CommandItem          (selectable row)
//   • CommandEmpty         (renders when nothing matches)
//
// Dependencies
//   npm i @radix-ui/react-use-interval @radix-ui/react-slot
//   npm i @radix-ui/react-icons       (optional for input icon)
//   npm i cmdk                        (Radix Command primitive)
//
// TailwindCSS is assumed.
// ───────────────────────────────────────────────────────────────

"use client";

import { forwardRef } from "react";
import {
  Command as CommandPrimitive,
  CommandList as List,
  CommandInput as InputBox,
  CommandItem as Item,
  CommandGroup as Group,
  CommandEmpty as Empty,
} from "cmdk";
import { cn } from "@/utils/classNames";

/* Root – adds max-height + border */
export const Command = forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex w-full flex-col overflow-hidden rounded-md border bg-white " +
        "text-sm shadow-md dark:bg-zinc-900 dark:border-zinc-700",
      className
    )}
    {...props}
  />
));
Command.displayName = "Command";

/* List – scroll area */
export const CommandList = forwardRef(({ className, ...props }, ref) => (
  <List
    ref={ref}
    className={cn("max-h-60 overflow-y-auto overscroll-contain", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

/* Input – search bar on top */
export const CommandInput = forwardRef(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3">
    {/* Optional magnifying-glass icon could go here */}
    <InputBox
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md bg-transparent py-2 text-sm " +
          "placeholder:text-muted-foreground focus:outline-none",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

/* Group – labelled section */
export const CommandGroup = forwardRef(({ className, ...props }, ref) => (
  <Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-muted-foreground [&[hidden]]:hidden",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

/* Item – selectable row */
export const CommandItem = forwardRef(
  ({ className, ...props }, ref) => (
    <Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 " +
          "outline-none aria-selected:bg-brand/5 aria-selected:text-brand " +
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
);
CommandItem.displayName = "CommandItem";

/* Empty – shown when nothing matches */
export const CommandEmpty = forwardRef(
  ({ className, ...props }, ref) => (
    <Empty
      ref={ref}
      className={cn("px-4 py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CommandEmpty.displayName = "CommandEmpty";
