// components/GroupSelector.jsx
"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { cn } from "@/utils/classNames"; 

/* shadcn/ui */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";

/**
 * Multi-select pop-over for picking Groups.
 *
 * Props
 * ─────────────────────────────────────────
 * @param {String[]} value     – selected group IDs
 * @param {Function} onChange  – (ids:string[]) callback
 * @param {Boolean}  disabled  – block interaction
 */
export default function GroupSelector({ value = [], onChange, disabled }) {
  const { data: groups = [], isLoading } = useGroups();
  const [open, setOpen] = useState(false);
  const selectedLabels = useMemo(
    () =>
      groups
        .filter((g) => value.includes(g.id))
        .map((g) => g.name)
        .join(", "),
    [groups, value]
  );

  const toggleId = (id) => {
    const exists = value.includes(id);
    const next = exists ? value.filter((x) => x !== id) : [...value, id];
    onChange?.(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value.length && "text-muted-foreground"
          )}
        >
          {value.length ? selectedLabels : "Select groups…"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search group…" />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading…</CommandEmpty>
            ) : (
              <CommandGroup>
                {groups.map((g) => {
                  const checked = value.includes(g.id);
                  return (
                    <CommandItem
                      key={g.id}
                      onSelect={() => toggleId(g.id)}
                      className="cursor-pointer pl-8"
                    >
                      <Check
                        className={cn(
                          "absolute left-2 h-4 w-4",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {g.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
