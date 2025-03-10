"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ToolData } from "@/types/tool";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Define columns dynamically for all day percentages
const dayColumns = [
  { key: "ABA_PERCENT_FLAGED_3DAYS", label: "3 Days" },
  { key: "ABA_PERCENT_FLAGED_7DAYS", label: "7 Days" },
  { key: "ABA_PERCENT_FLAGED_14DAYS", label: "14 Days" },
  { key: "ABA_PERCENT_FLAGED_21DAYS", label: "21 Days" },
  { key: "ABA_PERCENT_FLAGED_28DAYS", label: "28 Days" },
  { key: "ABA_PERCENT_FLAGED_35DAYS", label: "35 Days" },
  { key: "ABA_PERCENT_FLAGED_42DAYS", label: "42 Days" },
  { key: "ABA_PERCENT_FLAGED_49DAYS", label: "49 Days" },
  { key: "ABA_PERCENT_FLAGED_56DAYS", label: "56 Days" },
  { key: "ABA_PERCENT_FLAGED_63DAYS", label: "63 Days" },
  { key: "ABA_PERCENT_FLAGED_70DAYS", label: "70 Days" },
  { key: "ABA_PERCENT_FLAGED_77DAYS", label: "77 Days" },
  { key: "ABA_PERCENT_FLAGED_84DAYS", label: "84 Days" },
  { key: "ABA_PERCENT_FLAGED_91DAYS", label: "91 Days" },
];

// Define column colors (customizable)
const columnColors: Record<string, string> = {
  CEID: "bg-purple-100 text-black",
  ABA_PERCENT_FLAGED_28DAYS: "bg-yellow-200 text-black",
  ABA_PERCENT_FLAGED_14DAYS: "bg-green-200 text-black",
  ABA_PERCENT_FLAGED_35DAYS: "bg-red-200 text-white",
};

export default function DataTable({ data }: { data: ToolData[] }) {
  // Load saved settings from local storage
  const loadFromLocalStorage = (key: string, defaultValue: any) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    }
    return defaultValue;
  };

  // State hooks with persistence
  const [sorting, setSorting] = React.useState<SortingState>(
    loadFromLocalStorage("tableSorting", [])
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    loadFromLocalStorage("tableFilters", [])
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    loadFromLocalStorage("tableVisibility", {})
  );
  const [rowSelection, setRowSelection] = React.useState(
    loadFromLocalStorage("tableRowSelection", {})
  );
  const [showPopup, setShowPopup] = React.useState(false);

  // Save to local storage when state changes
  React.useEffect(() => {
    localStorage.setItem("tableSorting", JSON.stringify(sorting));
  }, [sorting]);

  React.useEffect(() => {
    localStorage.setItem("tableFilters", JSON.stringify(columnFilters));
  }, [columnFilters]);

  React.useEffect(() => {
    localStorage.setItem("tableVisibility", JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  React.useEffect(() => {
    localStorage.setItem("tableRowSelection", JSON.stringify(rowSelection));
  }, [rowSelection]);

  const columns: ColumnDef<ToolData>[] = [
    {
      accessorKey: "CEID",
      header: "CEID",
      cell: ({ row }) => <div className={`capitalize ${columnColors["CEID"]}`}>{row.getValue<string>("CEID")}</div>,
    },
    ...dayColumns.map(({ key, label }): ColumnDef<ToolData> => ({
      accessorKey: key,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            if (key === "ABA_PERCENT_FLAGED_28DAYS") {
              setShowPopup(true);
            }
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          {label} <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue<number>(key);
        return (
          <div className={`text-right ${columnColors[key] ?? ""}`}>
            {value !== undefined && !isNaN(value) ? `${(value * 100).toFixed(2)}%` : "0%"}
          </div>
        );
      },
    })),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search CEIDs..."
          value={(table.getColumn("CEID")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("CEID")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="space-x-2">
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {/* Popup for "28 Days" Column */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogTitle>Baseline</DialogTitle>
          <p>Baseline is 28 days for proper 1 month comparison.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
