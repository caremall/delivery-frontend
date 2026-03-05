"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navigation } from "@/lib/sidebar-items";
import { useAuthStore } from "@/lib/auth-store";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggle,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { manager, clearAuth } = useAuthStore();

  const isItemActive = (item: any) => {
    if (pathname === item.href) return true;
    if (item.href && item.href !== "#") {
      return pathname.startsWith(item.href + "/");
    }
    if (item.children && item.children.length > 0) {
      return item.children.some((child: any) => isChildActive(child));
    }
    return false;
  };

  const isChildActive = (child: any) => pathname === child.href;

  // Auto-expand parents when children are active
  useEffect(() => {
    const activeParents = navigation
      .filter((item) => {
        if (item.children) {
          return item.children.some((child: any) => isChildActive(child));
        }
        return false;
      })
      .map((item) => item.name);

    setExpandedItems(activeParents);
  }, [pathname]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleNavigation = (item: any, isMobile = false) => {
    if (item.href && item.href !== "#") {
      router.push(item.href);
      if (isMobile) onClose();
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    router.push("/login");
  };

  const renderNavItem = (item: any, isMobile = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isActive = isItemActive(item);
    const hasValidHref = item.href && item.href !== "#";

    return (
      <div key={item.name}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full h-10 transition-colors cursor-pointer",
            isCollapsed && !isMobile
              ? "justify-center px-2"
              : "justify-start gap-3",
            isActive &&
            "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
            !isActive && "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          )}
          title={isCollapsed && !isMobile ? item.name : undefined}
          onClick={() => {
            if (hasChildren && !isCollapsed) {
              toggleExpanded(item.name);
            } else if (hasValidHref) {
              handleNavigation(item, isMobile);
            }
          }}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {(!isCollapsed || isMobile) && (
            <>
              <span className="flex-1 text-left font-medium text-sm">
                {item.name}
              </span>
              {hasChildren &&
                (isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ))}
            </>
          )}
        </Button>

        {hasChildren && isExpanded && (!isCollapsed || isMobile) && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-red-100 pl-2">
            {item.children.map((child: any) => {
              const childActive = isChildActive(child);
              return (
                <Button
                  key={child.name}
                  variant={childActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full h-9 justify-start gap-3 text-sm transition-colors cursor-pointer",
                    childActive &&
                    "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
                    !childActive && "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                  onClick={() => handleNavigation(child, isMobile)}
                >
                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{child.name}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-40 transition-all duration-300 bg-white border-r border-gray-200",
          isCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <img src="/caremall.png" alt="CareMall Logo" className="h-8 object-contain" />
              </div>
            )}
            {isCollapsed && (
              <div className="flex items-center justify-center mx-auto">
                <img src="/caremall.png" alt="CareMall Logo" className="h-6 object-contain" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0 hover:bg-gray-100 cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* User info */}
          {!isCollapsed && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-gray-100 rounded-xl overflow-hidden">
                  <AvatarImage
                    src={manager?.assignedWarehouses?.[0]?.hubImage}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-red-600 text-white text-sm font-semibold italic">
                    {manager?.fullName?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate tracking-tight">
                    {manager?.fullName || "Manager"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {manager?.email || "manager@caremall.in"}
                  </p>
                  <p className="text-xs text-red-600 truncate capitalize">
                    {manager?.role?.name || "Hub Manager"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => renderNavItem(item))}
          </nav>

          {/* Logout */}
          <div className="shrink-0 px-2 py-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:hidden border-r border-gray-200 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img src="/caremall.png" alt="CareMall Logo" className="h-8 object-contain" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile user info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-gray-200 rounded-xl overflow-hidden">
                <AvatarImage
                  src={manager?.assignedWarehouses?.[0]?.hubImage}
                  className="object-cover"
                />
                <AvatarFallback className="bg-red-600 text-white text-sm font-semibold italic">
                  {manager?.fullName?.charAt(0) || "M"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate tracking-tight">
                  {manager?.fullName || "Manager"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {manager?.email || "manager@caremall.in"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => renderNavItem(item, true))}
          </nav>

          {/* Mobile logout */}
          <div className="shrink-0 px-2 py-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
