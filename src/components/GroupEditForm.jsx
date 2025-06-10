// components/GroupEditForm.jsx
"use client";

/**
 * Admin-side form to edit a Group’s:
 *   • Name
 *   • Description
 *   • Members  → add / remove subscribers
 *
 * Props
 * ─────────────────────────────────────────
 * @param {string}   id
 * @param {object}   initial  {
 *     name: string,
 *     description: string,
 *     subscriberIds: string[],   // current members
 *     memberCount:   number
 * }
 */

import { useState, useMemo } from "react";
import {
  useSubscribers,
  useAddSubscribersToGroup,
  useUpdateGroup,
} from "@/hooks/useSubscribers"; // add + remove helpers live here
import { useUpdateGroup as useMetaUpdate } from "@/hooks/useGroups"; // rename / desc
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, Save, UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/utils/classNames";

export default function GroupEditForm({ id, initial }) {
  /* ───────────────────────────────────
     1. Local state
  ─────────────────────────────────── */
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // selections
  const [selectedAdd, setSelectedAdd] = useState([]);
  const [selectedRemove, setSelectedRemove] = useState([]);

  /* ───────────────────────────────────
     2. Queries
  ─────────────────────────────────── */
  const {
    data: subData,
    isLoading: loadingSubs,
  } = useSubscribers({ page, pageSize: 20, search });

  /* ───────────────────────────────────
     3. Mutations
  ─────────────────────────────────── */
  const { mutate: updateMeta, isLoading: savingMeta } = useMetaUpdate();
  const { mutate: bulkAdd, isLoading: adding } = useAddSubscribersToGroup();
  const { mutate: bulkRemove, isLoading: removing } = useAddSubscribersToGroup(); // reuse: negative list

  const busy = savingMeta || adding || removing;

  /* ───────────────────────────────────
     4. Handlers
  ─────────────────────────────────── */
  const saveMeta = () => {
    if (!name.trim()) return;
    updateMeta({ id, name: name.trim(), description });
  };

  const addMembers = () => {
    if (!selectedAdd.length) return;
    bulkAdd({ groupId: id, subscriberIds: selectedAdd });
    setSelectedAdd([]);
  };

  const removeMembers = () => {
    if (!selectedRemove.length) return;
    bulkRemove({
      groupId: id,
      subscriberIdsRemove: selectedRemove,
    });
    setSelectedRemove([]);
  };

  /* helper */
  const isMember = (sid) => initial.subscriberIds.includes(sid);

  /* ───────────────────────────────────
     5. UI
  ─────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Meta form */}
      <div className="space-y-4 rounded-lg border p-4 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Group Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={saveMeta} disabled={savingMeta}>
          {savingMeta ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Members */}
      <div className="space-y-4 rounded-lg border p-4 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">
          Members ({initial.memberCount})
        </h2>

        {/* Search */}
        <Input
          placeholder="Search mobile / playerId…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* Table */}
        <div className="rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Player ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingSubs ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6 text-center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : (
                subData?.results.map((sub) => {
                  const member = isMember(sub.id);
                  const addChecked = selectedAdd.includes(sub.id);
                  const removeChecked = selectedRemove.includes(sub.id);

                  return (
                    <TableRow
                      key={sub.id}
                      className={cn(
                        member && "bg-brand/5 dark:bg-brand/10"
                      )}
                    >
                      <TableCell>
                        {member ? (
                          <Checkbox
                            checked={removeChecked}
                            onCheckedChange={() =>
                              setSelectedRemove((prev) =>
                                prev.includes(sub.id)
                                  ? prev.filter((x) => x !== sub.id)
                                  : [...prev, sub.id]
                              )
                            }
                          />
                        ) : (
                          <Checkbox
                            checked={addChecked}
                            onCheckedChange={() =>
                              setSelectedAdd((prev) =>
                                prev.includes(sub.id)
                                  ? prev.filter((x) => x !== sub.id)
                                  : [...prev, sub.id]
                              )
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>{sub.mobile || "—"}</TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {sub.playerId}
                      </TableCell>
                      <TableCell>
                        {member ? "In group" : "Not in group"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={addMembers}
            disabled={!selectedAdd.length || adding}
          >
            {adding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add {selectedAdd.length}
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            onClick={removeMembers}
            disabled={!selectedRemove.length || removing}
          >
            {removing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing…
              </>
            ) : (
              <>
                <UserMinus className="mr-2 h-4 w-4" />
                Remove {selectedRemove.length}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
