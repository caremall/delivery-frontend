"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  MoreHorizontal,
  Clock,
  ShieldX,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Bike,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { RiderDetailView } from "@/components/dashboard/RiderDetailView";
import { CreateRiderModal } from "@/components/dashboard/CreateRiderModal";

// ─── Status Helpers ───────────────────────────────────────────────────────────

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
    case "active": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "inactive": return "bg-gray-50 text-gray-500 border-gray-200";
    case "suspended": return "bg-red-50 text-red-600 border-red-200";
    default: return "bg-gray-50 text-gray-400 border-gray-200";
  }
};

const getKycStyles = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-50 text-green-700 border-green-200";
    case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "under_review": return "bg-blue-50 text-blue-700 border-blue-200";
    case "rejected": return "bg-red-50 text-red-600 border-red-200";
    default: return "bg-gray-50 text-gray-500 border-gray-200";
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, iconBg, accent }: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; iconBg: string; accent: string;
}) {
  return (
    <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group relative">
      <div className={cn("absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl transition-all duration-300 group-hover:h-[4px]", accent)} />
      <CardContent className="p-5 flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
          <span className="text-2xl font-semibold text-gray-800 tabular-nums">{value}</span>
          {sub && <span className="text-[11px] text-emerald-600 font-medium">{sub}</span>}
        </div>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AllRidersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<{ selectFilters: Record<string, string>; dateFilters: Record<string, { from?: string | Date; to?: string | Date }> }>({
    selectFilters: {},
    dateFilters: {},
  });
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: ridersData, isLoading } = useQuery({
    queryKey: ["riders", debouncedSearch, activeFilters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      
      // Apply select filters dynamically to query
      if (activeFilters.selectFilters.status) {
        params.append("status", activeFilters.selectFilters.status);
      }
      if (activeFilters.selectFilters.kyc_status) {
        params.append("kyc_status", activeFilters.selectFilters.kyc_status);
      }
      
      // Apply date filters dynamically
      if (activeFilters.dateFilters.createdAt?.from) {
        params.append("startDate", new Date(activeFilters.dateFilters.createdAt.from).toISOString());
      }
      if (activeFilters.dateFilters.createdAt?.to) {
        params.append("endDate", new Date(activeFilters.dateFilters.createdAt.to).toISOString());
      }

      params.append("page", String(page));
      params.append("limit", String(limit));
      return (await axiosInstance.get(`/riders?${params}`)).data.data;
    },
  });

  const riders = ridersData?.riders || [];
  const stats = ridersData?.stats || { totalRiders: 0, activeRiders: 0, pendingKyc: 0, suspendedRiders: 0 };
  const pagination = ridersData?.pagination;

  // ─── Column Definitions ────────────────────────────────────────────────────

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Rider",
      enableSorting: false,
      cell: ({ row }) => {
        const { name, avatar } = row.original;
        return (
          <div
            className="flex items-center gap-3 cursor-pointer group/row"
            onClick={() => setSelectedRiderId(row.original._id)}
          >
            <Avatar className="h-9 w-9 border border-gray-100 shadow-sm flex-shrink-0">
              <AvatarImage src={avatar || undefined} alt={name} />
              <AvatarFallback className="bg-red-50 text-red-600 text-xs font-semibold">
                {name?.charAt(0) || "R"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-gray-800 group-hover/row:text-red-600 transition-colors truncate">
                {name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                #{row.original._id?.slice(-6)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-gray-700">+91 {row.original.phone}</span>
          <span className="text-[11px] text-gray-400 truncate">{row.original.email || "—"}</span>
        </div>
      ),
    },
    {
      id: "kyc_status",
      accessorKey: "kyc.status",
      header: "KYC",
      cell: ({ row }) => {
        const status = row.original.kyc?.status || "pending";
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider",
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
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={cn(
            "inline-flex items-center justify-center px-3 py-1 border rounded-lg text-[10px] font-semibold tracking-widest uppercase min-w-[90px]",
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
      cell: ({ row }) => {
        const delivered = row.original.performance?.deliveredCount ?? "—";
        const total = row.original.performance?.totalOrders ?? "—";
        return (
          <div className="flex flex-col items-start">
            <span className="text-[13px] font-semibold text-gray-800 tabular-nums">
              {delivered}
              <span className="text-gray-300 font-normal"> / {total}</span>
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Delivered</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-[12px] text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg cursor-pointer">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-gray-100 p-1">
              <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-[12px] font-medium" onClick={() => setSelectedRiderId(row.original._id)}>
                View Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const tableFilters = [
    {
      type: "select" as const,
      column: "status",
      placeholder: "Availability",
      options: [
        { label: "Available", value: "active" },
        { label: "Off Duty", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ],
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
      ],
    },
    {
      type: "date" as const,
      column: "createdAt",
      placeholder: "Joined Date",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fa] p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800 tracking-tight">Rider Management</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Monitor, manage and audit your delivery fleet</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold h-9 px-5 rounded-xl shadow-sm shadow-red-200 transition-all active:scale-95 flex gap-2 cursor-pointer text-[13px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5px]" /> Add Rider
        </Button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Riders"
          value={stats.totalRiders}
          icon={Users}
          iconBg="bg-violet-100 text-violet-600"
          accent="bg-violet-400"
        />
        <StatCard
          label="On Duty"
          value={stats.activeRiders}
          sub={stats.activeRiders > 0 ? `${Math.round((stats.activeRiders / Math.max(stats.totalRiders, 1)) * 100)}% active` : undefined}
          icon={UserCheck}
          iconBg="bg-emerald-100 text-emerald-600"
          accent="bg-emerald-400"
        />
        <StatCard
          label="Pending KYC"
          value={stats.pendingKyc}
          icon={Clock}
          iconBg="bg-amber-100 text-amber-600"
          accent="bg-amber-400"
        />
        <StatCard
          label="Suspended"
          value={stats.suspendedRiders}
          icon={ShieldX}
          iconBg="bg-red-100 text-red-500"
          accent="bg-red-400"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <CustomDataTable
          columns={columns}
          data={riders}
          isLoading={isLoading}
          manualPagination={true}
          pageCount={pagination?.totalPages || 0}
          pagination={{ pageIndex: page - 1, pageSize: limit }}
          onPaginationChange={(p) => { setPage(p.pageIndex + 1); setLimit(p.pageSize); }}
          onSearch={(term) => setSearch(term)}
          onFilterChange={(filters) => setActiveFilters(filters as any)}
          filters={tableFilters}
          exportFileName="caremall_rider_fleet"
        />
      </div>

      {/* ── Modals ── */}
      {selectedRiderId && (
        <RiderDetailView
          riderId={selectedRiderId}
          isOpen={!!selectedRiderId}
          onClose={() => setSelectedRiderId(null)}
        />
      )}
      <CreateRiderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
