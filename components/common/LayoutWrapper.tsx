"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Menu,
  User,
  LogOut,
  Bell,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/common/Sidebar";
import { navigation } from "@/lib/sidebar-items";
import { useAuthStore } from "@/lib/auth-store";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

type PageInfo = {
  name: string;
  icon: any;
  parentName?: string;
  parentIcon?: any;
};

const findCurrentPage = (
  items: typeof navigation,
  pathname: string
): PageInfo | null => {
  for (const item of items) {
    if (item.href === pathname || pathname.startsWith(item.href + "/")) {
      if (item.href !== "#") {
        return { name: item.name, icon: item.icon };
      }
    }

    if (item.children) {
      for (const child of item.children) {
        if (
          child.href === pathname ||
          pathname.startsWith(child.href + "/")
        ) {
          return {
            name: child.name,
            icon: child.icon,
            parentName: item.name,
            parentIcon: item.icon,
          };
        }
      }
    }
  }
  return null;
};

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { manager, token, clearAuth } = useAuthStore();

  const noLayoutRoutes = ["/", "/login"];

  // No layout for auth pages
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Not authenticated → redirect
  if (!token || !manager) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  const currentPage = findCurrentPage(navigation, pathname) || {
    name: "Dashboard",
    icon: LayoutDashboard,
  };

  const PageIcon = currentPage.icon;
  const ParentIcon = currentPage.parentIcon;

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden cursor-pointer"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumb / Page Title */}
              <div className="flex items-center gap-2">
                {currentPage.parentName ? (
                  <>
                    {ParentIcon && (
                      <ParentIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-lg font-medium text-gray-700">
                      {currentPage.parentName}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-medium text-gray-900">
                      {currentPage.name}
                    </span>
                  </>
                ) : (
                  <>
                    <PageIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-lg font-medium text-gray-900">
                      {currentPage.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {manager?.fullName?.charAt(0) || "M"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">
                      {manager?.fullName || "Manager"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {manager?.email || "manager@caremall.in"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
