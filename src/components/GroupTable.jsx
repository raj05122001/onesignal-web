// components/GroupTable.jsx
"use client";

/**
 * Admin-side Groups manager
 * ────────────────────────────────────────────────────────────
 * • Lists all groups with member counts
 * • Create, rename / edit description, delete groups
 * • Uses hooks in /hooks/useGroups.js for data + mutations
 */

import { useState } from "react";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from "@/hooks/useGroups";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2, Info } from "lucide-react";
import { cn } from "@/utils/classNames";

export default function GroupTable() {
  /* ── fetch groups ── */
  const { data: groups = [], isLoading } = useGroups();

  /* ── local state for create ── */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: createGroup, isLoading: creating } = useCreateGroup();
  const { mutate: updateGroup } = useUpdateGroup();
  const { mutate: deleteGroup } = useDeleteGroup();

  const handleCreate = () => {
    if (!name.trim()) return;
    createGroup(
      { name: name.trim(), description },
      { onSuccess: () => (setName(""), setDescription("")) }
    );
  };

  const rename = (g) => {
    const newName = prompt("Rename group:", g.name);
    if (newName && newName.trim() && newName !== g.name) {
      updateGroup({ id: g.id, name: newName.trim() });
    }
  };

  const editDesc = (g) => {
    const newDesc = prompt("Description:", g.description || "");
    if (newDesc !== null) {
      updateGroup({ id: g.id, description: newDesc });
    }
  };

  const remove = (g) => {
    if (
      confirm(`Are you sure you want to delete the group “${g.name}”?`)
    ) {
      deleteGroup(g.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create group */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-48"
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-[12rem]"
        />
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </>
          )}
        </Button>
      </div>

      {/* Groups table */}
      <div className="rounded-lg border bg-white dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24 text-right">Members</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="p-6 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : groups.length ? (
              groups.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>
                    {g.description || (
                      <span className="italic text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{g.memberCount}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => rename(g)}
                      aria-label="Rename"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => editDesc(g)}
                      aria-label="Edit description"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => remove(g)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="p-6 text-center text-muted-foreground"
                >
                  No groups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
