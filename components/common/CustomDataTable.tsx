"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type FilterFn,
} from "@tanstack/react-table"
import { ArrowUpDown, Download, Trash2, Columns, CalendarIcon, FilterIcon, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  type: "select" | "date"
  column: string
  placeholder: string
  options?: FilterOption[]
}

// ... (interfaces remain the same)

interface CustomDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  exportFileName?: string
  onDeleteSelected?: (rows: TData[]) => void
  onRowClick?: (row: TData) => void
  filters?: FilterConfig[]
  // Server-side pagination props
  manualPagination?: boolean
  pageCount?: number
  pagination?: {
    pageIndex: number
    pageSize: number
  }
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
  hideSearch?: boolean  // Hide built-in search for server-side search
  onSearch?: (term: string) => void // Callback for server-side search
  hideRowSelectionInfo?: boolean // Prop to hide "X of Y rows selected"
  isLoading?: boolean
}



// Memoized filter functions
const exactMatchFilter: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue) return true
  const value = row.getValue(columnId)
  return String(value).toLowerCase() === String(filterValue).toLowerCase()
}

const dateRangeFilter: FilterFn<any> = (row, columnId, filterValue: { from?: Date; to?: Date }) => {
  if (!filterValue?.from && !filterValue?.to) return true

  const cellValue = row.getValue(columnId)
  if (!cellValue) return false

  try {
    const cellDate = new Date(cellValue as any)
    if (filterValue.from && cellDate < filterValue.from) return false
    if (filterValue.to && cellDate > filterValue.to) return false
    return true
  } catch {
    return false
  }
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, prop) => current?.[prop], obj)
}

const exportToCSV = (
  rows: any[],
  columns: ColumnDef<any, any>[],
  columnVisibility: VisibilityState,
  filename: string,
) => {
  const visibleColumns = columns.filter((col) => columnVisibility[(col as any).id] !== false)

  const headers = visibleColumns.map((col) => {
    const header = col.header
    if (typeof header === 'string') return header
    if (typeof header === 'function') return (col as any).id
    return (col as any).id
  })

  const csvContent = [
    headers.join(","),
    ...rows.map(row => {
      return visibleColumns.map(col => {
        const value = row[(col as any).accessorKey] ?? ''
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(",")
    })
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.includes('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function CustomDataTable<TData, TValue>({
  columns,
  data,
  exportFileName = "data",
  onDeleteSelected,
  onRowClick,
  filters = [],
  manualPagination = false,
  pageCount,
  pagination: controlledPagination,
  onPaginationChange,
  hideSearch = false,
  onSearch,
  hideRowSelectionInfo = true,
  isLoading = false,
}: CustomDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  // Internal pagination state for client-side mode
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Use controlled pagination if provided, otherwise internal
  const pagination = controlledPagination ?? internalPagination

  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [dateFilters, setDateFilters] = React.useState<Record<string, { from?: Date; to?: Date }>>({})
  const [selectFilters, setSelectFilters] = React.useState<Record<string, string>>({})

  // Handle pagination changes
  const handlePaginationChange = React.useCallback(
    (updaterOrValue: any) => {
      const newPagination = typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue

      if (onPaginationChange) {
        onPaginationChange(newPagination)
      } else {
        setInternalPagination(newPagination)
      }
    },
    [pagination, onPaginationChange]
  )

  // Memoized data and columns
  const tableData = React.useMemo(() => data, [data])
  const tableColumns = React.useMemo(() => columns, [columns])

  // Extract options from data with memoization
  const extractOptionsFromData = React.useCallback((columnPath: string): FilterOption[] => {
    const uniqueValues = new Map<string, string>()

    tableData.forEach((item: any) => {
      const value = getNestedValue(item, columnPath)
      if (value !== undefined && value !== null) {
        const stringValue = String(value)
        if (!uniqueValues.has(stringValue)) {
          uniqueValues.set(stringValue, stringValue)
        }
      }
    })

    return Array.from(uniqueValues, ([value, label]) => ({ value, label }))
  }, [tableData])

  // Get filter options with memoization
  const getFilterOptions = React.useCallback((filter: FilterConfig): FilterOption[] => {
    if (filter.options && filter.options.length > 0) {
      return filter.options
    }
    return extractOptionsFromData(filter.column)
  }, [extractOptionsFromData])

  // Enhanced columns with proper filter functions
  const enhancedColumns = React.useMemo(() => {
    return tableColumns.map((col) => {
      const columnId = (col as any).accessorKey || col.id
      const filterConfig = filters.find((f) => f.column === columnId)

      if (filterConfig?.type === "select") {
        return {
          ...col,
          filterFn: exactMatchFilter,
        }
      }
      if (filterConfig?.type === "date") {
        return {
          ...col,
          filterFn: dateRangeFilter,
        }
      }
      return col
    })
  }, [tableColumns, filters])

  // Create filter state for react-table
  const combinedColumnFilters = React.useMemo(() => {
    const filters: ColumnFiltersState = []

    // Add select filters
    Object.entries(selectFilters).forEach(([columnId, value]) => {
      if (value) {
        filters.push({ id: columnId, value })
      }
    })

    // Add date filters
    Object.entries(dateFilters).forEach(([columnId, dateRange]) => {
      if (dateRange.from || dateRange.to) {
        filters.push({ id: columnId, value: dateRange })
      }
    })

    return filters
  }, [selectFilters, dateFilters])

  const table = useReactTable({
    data: tableData,
    columns: enhancedColumns,
    pageCount: manualPagination ? pageCount : undefined,
    manualPagination, // ✅ Enable server-side pagination if requested
    manualFiltering: !!onSearch, // ✅ Enable manual filtering if onSearch is provided
    filterFns: {
      exact: exactMatchFilter,
      dateRange: dateRangeFilter,
    },
    state: {
      sorting,
      columnFilters: combinedColumnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination, // ✅ Pass controlled or internal pagination state
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange, // ✅ Use our custom handler
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId) || '').toLowerCase()
      return value.includes(filterValue.toLowerCase())
    },
  })

  // Optimized row click handler
  const handleRowClick = React.useCallback((row: TData) => {
    onRowClick?.(row)
  }, [onRowClick])

  // Optimized filter handlers
  const handleSelectFilterChange = React.useCallback((columnId: string, value: string) => {
    setSelectFilters(prev => {
      if (value === "__all__") {
        const newState = { ...prev }
        delete newState[columnId]
        return newState
      }
      return { ...prev, [columnId]: value }
    })
    table.setPageIndex(0) // Reset to first page when filter changes
  }, [table])

  const handleDateFilterChange = React.useCallback((columnId: string, range: { from?: Date; to?: Date } | undefined) => {
    setDateFilters(prev => ({
      ...prev,
      [columnId]: range || {}
    }))
    table.setPageIndex(0)
  }, [table])

  const handleGlobalFilterChange = React.useCallback((value: string) => {
    setGlobalFilter(value)
    if (onSearch) {
      onSearch(value)
    }
    table.setPageIndex(0)
  }, [table, onSearch])

  // Clear all filters
  const clearAllFilters = React.useCallback(() => {
    setSelectFilters({})
    setDateFilters({})
    setGlobalFilter("")
    table.setPageIndex(0)
  }, [table])

  const hasActiveFilters = Object.keys(selectFilters).length > 0 ||
    Object.values(dateFilters).some(range => range.from || range.to) ||
    globalFilter

  return (
    <div className="w-full bg-white p-1 px-4 rounded-md">
      {/* Toolbar */}
      <div className="flex items-center gap-2 py-4">
        {!hideSearch && (
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              className="pl-10 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm shadow-sm"
            />
          </div>
        )}

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="h-12"
          >
            Clear Filters
          </Button>
        )}

        {onDeleteSelected && table.getSelectedRowModel().rows.length > 0 && (
          <Button
            variant="destructive"
            className="flex items-center gap-2 cursor-pointer h-12"
            onClick={() => onDeleteSelected(table.getSelectedRowModel().rows.map((r) => r.original))}
          >
            <Trash2 className="h-4 w-4" /> Delete Selected ({table.getSelectedRowModel().rows.length})
          </Button>
        )}

        <div className="ml-auto flex gap-2 items-center">
          {/* Columns Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 h-12 bg-transparent">
                <Columns className="h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Filters */}
          {filters.some((f) => f.type === "date") && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-12 bg-transparent">
                  <CalendarIcon className="h-4 w-4" /> Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-4">
                  {filters
                    .filter((f) => f.type === "date")
                    .map((filter) => {
                      const currentDateFilter = dateFilters[filter.column] || {}
                      return (
                        <div key={filter.column} className="space-y-2">
                          <label className="text-sm font-medium">{filter.placeholder}</label>
                          <Calendar
                            mode="range"
                            selected={currentDateFilter as any}
                            onSelect={(range) => handleDateFilterChange(filter.column, range || {})}
                            numberOfMonths={2}
                            initialFocus
                          />
                          {currentDateFilter.from && currentDateFilter.to && (
                            <p className="text-xs text-muted-foreground">
                              {format(currentDateFilter.from, "MMM d, yyyy")} - {format(currentDateFilter.to, "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      )
                    })}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Select Filters */}
          {filters.some((f) => f.type === "select") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-12 bg-transparent">
                  <FilterIcon className="h-4 w-4" /> Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                {filters
                  .filter((f) => f.type === "select")
                  .map((filter) => {
                    const options = getFilterOptions(filter)
                    const currentValue = selectFilters[filter.column]

                    return (
                      <div key={filter.column} className="p-3 border-b last:border-b-0">
                        <p className="text-sm font-medium mb-2">{filter.placeholder}</p>
                        <Select
                          value={currentValue || "__all__"}
                          onValueChange={(value) => handleSelectFilterChange(filter.column, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={filter.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="__all__">All</SelectItem>
                              {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            className="flex items-center gap-2 h-12 bg-transparent"
            onClick={() => exportToCSV(tableData, tableColumns, columnVisibility, exportFileName)}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="border" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="border bg-gray-50 py-2 h-10 font-normal" key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="h-4 w-4" />}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="border py-2" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            {!hideRowSelectionInfo && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">
                Page{" "}
                <strong>
                  {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </strong>
              </span>

              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}