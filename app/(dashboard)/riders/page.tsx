"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Bike,
  UserCheck,
  ShieldAlert,
  Users,
  MoreHorizontal,
  Clock,
  ShieldX,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDataTable } from "@/components/common/CustomDataTable";
import { type ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ─── Status Mapping Utilities ───────────────────────────────────────────

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active": return "Available";
    case "inactive": return "Off Duty";
    case "suspended": return "Suspended";
    default: return status;
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "active": return "border-purple-600 text-purple-600 bg-purple-50/50";
    case "inactive": return "border-gray-400 text-gray-500 bg-gray-50/50";
    case "suspended": return "border-red-500 text-red-500 bg-red-50/50";
    default: return "border-gray-200 text-gray-400";
  }
};

const getKycStyles = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-100 text-green-700 border-green-200";
    case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
    case "under_review": return "bg-blue-100 text-blue-700 border-blue-200";
    case "rejected": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const getKycIcon = (status: string) => {
  switch (status) {
    case "approved": return <ShieldCheck className="h-3 w-3" />;
    case "rejected": return <ShieldX className="h-3 w-3" />;
    case "under_review": return <Clock className="h-3 w-3" />;
    default: return <ShieldAlert className="h-3 w-3" />;
  }
};

import { RiderDetailView } from "@/components/dashboard/RiderDetailView";
import { CreateRiderModal } from "@/components/dashboard/CreateRiderModal";

// ─── Main Component ──────────────────────────────────────────────────────

export default function AllRidersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ─── Column Definitions ──────────────────────────────────────────────────
  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
      accessorKey: "name",
      header: "Rider Name",
      cell: ({ row }) => {
        const { name, avatar } = row.original;
        return (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedRiderId(row.original._id)}>
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={avatar || undefined} alt={name} />
              <AvatarFallback className="bg-red-50 text-red-600 text-xs font-bold">
                {name?.charAt(0) || "R"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-[#111827] text-sm leading-none mb-1 group-hover:text-red-600 transition-colors">
                {name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                ID: {row.original._id?.slice(-6) || "N/A"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact Details",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-gray-900 text-sm font-semibold">
            +91 {row.original.phone}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {row.original.email || "no-email@caremall.in"}
          </span>
        </div>
      ),
    },
    {
      id: "kyc_status",
      accessorKey: "kyc.status",
      header: "KYC Status",
      cell: ({ row }) => {
        const status = row.original.kyc?.status || "pending";
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
            getKycStyles(status)
          )}>
            {getKycIcon(status)}
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Availability",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={cn(
            "inline-flex items-center justify-center px-4 py-1.5 border rounded-xl text-[10px] font-bold tracking-widest uppercase min-w-[100px]",
            getStatusStyles(status)
          )}>
            {getStatusLabel(status)}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedOrders",
      header: "Orders",
      cell: ({ row }) => (
        <div className="flex flex-col items-center justify-center">
          <span className="text-[#111827] font-black text-sm tabular-nums">
            {row.original.performance?.deliveredCount || 0}
          </span>
          <span className="text-[9px] text-gray-400 font-bold uppercase">Delivered</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full cursor-pointer">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100">
              <DropdownMenuLabel>Rider Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2 cursor-pointer font-medium" onClick={() => setSelectedRiderId(row.original._id)}>
                View Full Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 cursor-pointer font-medium">
                Live Tracking
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 cursor-pointer font-medium">
                Payment History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2 cursor-pointer font-semibold text-red-600">
                Suspend Rider
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Use built-in CustomDataTable filtering capabilities
  const tableFilters = [
    {
      type: "select" as const,
      column: "status",
      placeholder: "Status",
      options: [
        { label: "Available", value: "active" },
        { label: "Off Duty", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ]
    },
    {
      type: "select" as const,
      column: "kyc_status",
      placeholder: "KYC Status",
      options: [
        { label: "Approved", value: "approved" },
        { label: "Pending", value: "pending" },
        { label: "Under Review", value: "under_review" },
        { label: "Rejected", value: "rejected" },
      ]
    },
    {
      type: "date" as const,
      column: "createdAt",
      placeholder: "Joined Date"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: ridersData, isLoading } = useQuery({
    queryKey: ["riders", debouncedSearch, statusFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", String(page));
      params.append("limit", String(limit));
      const res = await axiosInstance.get(`/riders?${params.toString()}`);
      return res.data.data;
    },
  });

  const riders = ridersData?.riders || [];
  const stats = ridersData?.stats || { totalRiders: 0, activeRiders: 0, pendingKyc: 0, suspendedRiders: 0 };
  const pagination = ridersData?.pagination;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Rider Management</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Monitor, manage and audit your delivery fleet performance
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#dc2626] hover:bg-red-700 text-white font-black h-12 px-8 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex gap-2 cursor-pointer"
        >
          <Plus className="h-5 w-5 stroke-[3px]" /> ADD NEW RIDER
        </Button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Riders</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#111827]">{stats.totalRiders}</span>
              <span className="text-[10px] text-green-600 font-medium">+5 added last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">On Duty</span>
            </div>
            <span className="text-3xl font-bold text-[#111827]">{stats.activeRiders}</span>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-600" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending KYC</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#111827]">{stats.pendingKyc}</span>
              <span className="text-[10px] text-green-600 font-medium">+2 this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-900" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suspended</span>
            </div>
            <span className="text-3xl font-bold text-[#111827]">{stats.suspendedRiders}</span>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Section - Using Built-in Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <CustomDataTable
          columns={columns}
          data={riders}
          isLoading={isLoading}
          manualPagination={true}
          pageCount={pagination?.totalPages || 0}
          pagination={{
            pageIndex: page - 1,
            pageSize: limit
          }}
          onPaginationChange={(newPagination) => {
            setPage(newPagination.pageIndex + 1);
            if (newPagination.pageSize !== limit) {
              setLimit(newPagination.pageSize);
            }
          }}
          onSearch={(term) => setSearch(term)}
          filters={tableFilters}
          exportFileName="caremall_rider_fleet"
        />
      </div>
      {/* Detail View Modal */}
      {selectedRiderId && (
        <RiderDetailView
          riderId={selectedRiderId}
          isOpen={!!selectedRiderId}
          onClose={() => setSelectedRiderId(null)}
        />
      )}

      {/* Create Rider Modal */}
      <CreateRiderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
