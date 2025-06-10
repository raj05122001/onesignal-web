// components/ui/checkbox.jsx
//
// Accessible Checkbox built on @radix-ui/react-checkbox
// -----------------------------------------------------
// • Keyboard-navigable, focus-ring, disabled state
// • Emits `checked` (true | false | "indeterminate")
// • Tailwind classes use your project’s `brand` colour
//
// Example
//   <Checkbox checked={value} onCheckedChange={setValue} />
//
// Dependencies:
//   npm i @radix-ui/react-checkbox
// -----------------------------------------------------

"use client";

import { forwardRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/utils/classNames";

export const Checkbox = forwardRef(
  (
    { className, checked, onCheckedChange, ...props },
    ref
  ) => {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded border border-input " +
            "ring-offset-background focus-visible:outline-none " +
            "focus-visible:ring-2 focus-visible:ring-brand " +
            "focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
            "disabled:opacity-50 data-[state=checked]:bg-brand " +
            "data-[state=checked]:text-white",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3 w-3" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = "Checkbox";
