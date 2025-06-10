// components/ui/table.jsx
//
// Simple, composable table primitives (shadcn/ui-style)
// ----------------------------------------------------
// Exports:
//   • Table
//   • TableHeader, TableBody
//   • TableRow, TableHead, TableCell
//
// Usage:
//   <Table>
//     <TableHeader>
//       <TableRow>
//         <TableHead>Name</TableHead>
//         <TableHead>Email</TableHead>
//       </TableRow>
//     </TableHeader>
//     <TableBody>
//       <TableRow>
//         <TableCell>Alice</TableCell>
//         <TableCell>alice@example.com</TableCell>
//       </TableRow>
//     </TableBody>
//   </Table>
//
// Tailwind CSS required.
// ----------------------------------------------------

import { forwardRef } from "react";
import { cn } from "@/utils/classNames";

/* ─────────────────────────────────────────
   Wrapper — keeps table horizontally scrollable
───────────────────────────────────────── */
export const Table = forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

/* <thead> */
export const TableHeader = forwardRef(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("[&>tr]:border-b", className)}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

/* <tbody> */
export const TableBody = forwardRef(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&>tr:last-child]:border-0", className)}
      {...props}
    />
  ),
);
TableBody.displayName = "TableBody";

/* <tr> */
export const TableRow = forwardRef(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800",
        "data-[state=selected]:bg-brand/5",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

/* <th> */
export const TableHead = forwardRef(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

/* <td> */
export const TableCell = forwardRef(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("px-2 py-2 align-middle", className)}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";
