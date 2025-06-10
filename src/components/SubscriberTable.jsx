// components/SubscriberTable.jsx
"use client";

import {
  useState,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  Search,
  Users,
  Filter,
  Download,
  Loader2,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { useSubscribers } from "@/hooks/useSubscribers";
import { useGroups } from "@/hooks/useGroups";
import { useAddSubscribersToGroup } from "@/hooks/useSubscribers";
import { cn } from "@/utils/classNames";
import { formatDate } from "@/utils/formatDate";

const PAGE_SIZE = 25;

export default function SubscriberTable() {
  /* State Management */
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState("");
  const [selected, setSelected] = useState([]);
  const [groupId, setGroupId] = useState("");

  /* Data Queries */
  const {
    data,
    isLoading,
    isFetching,
  } = useSubscribers({ page, pageSize: PAGE_SIZE, search });

  const { data: groups = [] } = useGroups();

  /* Mutations */
  const { mutate: addBulk, isLoading: isAdding } =
    useAddSubscribersToGroup();

  /* Debounced Search */
  useMemo(() => {
    const t = setTimeout(() => setSearch(typing), 400);
    return () => clearTimeout(t);
  }, [typing]);

  /* Helper Functions */
  const allIds = useMemo(
    () => (data?.results || []).map((s) => s.id),
    [data]
  );

  const toggleAll = useCallback(() => {
    setSelected((sel) =>
      sel.length === allIds.length ? [] : allIds
    );
  }, [allIds]);

  const toggleOne = (id) =>
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );

  const canAdd = !!groupId && selected.length > 0 && !isAdding;

  const handleAdd = () => {
    addBulk({ groupId, subscriberIds: selected });
    setSelected([]);
  };

  /* UI Components */
  return (
    <div className="space-y-6">
      {/* Enhanced Top Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-1 items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by mobile number or Player ID..."
              value={typing}
              onChange={(e) => setTyping(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Group Selector */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none cursor-pointer"
            >
              <option value="">Select target group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {selected.length} selected
            </Badge>
          )}
          
          <Button
            disabled={!canAdd}
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Group
              </>
            )}
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selected.length === allIds.length &&
                    allIds.length > 0
                  }
                  onCheckedChange={toggleAll}
                  className="border-slate-400"
                />
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">
                Mobile Number
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">
                Player ID
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">
                Created Date
              </TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 bg-slate-200 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-slate-200 rounded w-24"></div></TableCell>
                    <TableCell><div className="h-4 bg-slate-200 rounded w-32"></div></TableCell>
                    <TableCell><div className="h-4 bg-slate-200 rounded w-20"></div></TableCell>
                    <TableCell><div className="h-4 bg-slate-200 rounded w-16"></div></TableCell>
                  </TableRow>
                ))
              : (data?.results || []).map((sub, index) => (
                  <TableRow
                    key={sub.id}
                    className={cn(
                      "transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50",
                      selected.includes(sub.id) &&
                        "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(sub.id)}
                        onCheckedChange={() => toggleOne(sub.id)}
                        className="border-slate-400"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {sub.mobile ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{sub.mobile}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No mobile</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                      <div className="truncate max-w-[200px]" title={sub.playerId}>
                        {sub.playerId}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {formatDate(sub.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            
            {!isLoading && data?.results?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Users className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        No subscribers found
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 text-sm">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Enhanced Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{data?.totalPages || 1}</span>
            </span>
            {isFetching && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
              className="px-3"
            >
              <ChevronsLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === data?.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="px-3"
            >
              Next
              <ChevronsRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}