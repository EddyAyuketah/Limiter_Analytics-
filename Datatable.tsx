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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ToolData } from "@/types/tool";

// Define columns dynamically for all day percentages
const dayColumns = [
  { key: "ABA_PERCENT_FLAGGED_3DAYS", label: "3 Days" },
  { key: "ABA_PERCENT_FLAGGED_7DAYS", label: "7 Days" },
  { key: "ABA_PERCENT_FLAGGED_14DAYS", label: "14 Days" },
  { key: "ABA_PERCENT_FLAGGED_21DAYS", label: "21 Days" },
  { key: "ABA_PERCENT_FLAGGED_28DAYS", label: "28 Days" },
  { key: "ABA_PERCENT_FLAGGED_35DAYS", label: "35 Days" },
  { key: "ABA_PERCENT_FLAGGED_42DAYS", label: "42 Days" },
  { key: "ABA_PERCENT_FLAGGED_49DAYS", label: "49 Days" },
  { key: "ABA_PERCENT_FLAGGED_56DAYS", label: "56 Days" },
  { key: "ABA_PERCENT_FLAGGED_63DAYS", label: "63 Days" },
  { key: "ABA_PERCENT_FLAGGED_70DAYS", label: "70 Days" },
  { key: "ABA_PERCENT_FLAGGED_77DAYS", label: "77 Days" },
  { key: "ABA_PERCENT_FLAGGED_84DAYS", label: "84 Days" },
  { key: "ABA_PERCENT_FLAGGED_91DAYS", label: "91 Days" },
];

const columns: ColumnDef<ToolData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "CEID",
    header: "CEID",
    cell: ({ row }) => <div className="capitalize">{row.getValue<string>("CEID")}</div>,
  },
  ...dayColumns.map(({ key, label }): ColumnDef<ToolData> => ({
    accessorKey: key,
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {label} <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>(key);
      return <div className="text-right">{value !== undefined ? `${(value * 10).toFixed(2)}%` : "0%"}</div>;
    },
  })),
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const tool = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tool.CEID)}>Copy CEID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View CEID details</DropdownMenuItem>
            <DropdownMenuItem>Edit CEID settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function DataTable({ data }: { data: ToolData[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterMessage, setFilterMessage] = React.useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: (filters) => {
      setColumnFilters(filters);
      if (filters.length > 0) {
        setFilterMessage(`Applied ${filters.length} filter(s).`);
        setTimeout(() => setFilterMessage(null), 3000);
      }
    },
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
        {filterMessage && <span className="text-sm text-gray-500">{filterMessage}</span>}
        <div className="space-x-2">
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
