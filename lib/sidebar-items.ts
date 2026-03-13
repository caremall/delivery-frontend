import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Truck,
    ClipboardList,
    PackageCheck,
    PackageX,
    Send,
    RotateCcw,
    Boxes,
    History,
    Users,
    UserCheck,
    Bike,
    BarChart3,
    Settings,
    Undo2,
    Eye,
    ListOrdered,
    User,
} from "lucide-react";

export const navigation = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        name: "Orders",
        icon: ShoppingCart,
        href: "#",
        children: [
            {
                name: "All Orders",
                icon: ListOrdered,
                href: "/orders/all-orders",
            },
            {
                name: "Pending",
                icon: ClipboardList,
                href: "/orders/pending",
            },
            {
                name: "Shipped",
                icon: Send,
                href: "/orders/shipped",
            },
            {
                name: "Delivered",
                icon: Package,
                href: "/orders/delivered",
            },
        ],
    },
    {
        name: "Returns",
        icon: Undo2,
        href: "#",
        children: [
            {
                name: "Return Requests",
                icon: RotateCcw,
                href: "/returns",
            },
            {
                name: "Processed Returns",
                icon: PackageCheck,
                href: "/returns/processed",
            },
        ],
    },
    {
        name: "Inventory",
        icon: Boxes,
        href: "#",
        children: [
            {
                name: "All Products",
                icon: Package,
                href: "/inventory/all",
            },
        ],
    },
    {
        name: "Rider Management",
        icon: Bike,
        href: "#",
        children: [
            {
                name: "All Riders",
                icon: Users,
                href: "/riders",
            },
            {
                name: "Active Riders",
                icon: UserCheck,
                href: "/riders/active",
            },
        ],
    },
    {
        name: "Analytics",
        icon: BarChart3,
        href: "/analytics",
    },
    {
        name: "My Profile",
        icon: User,
        href: "/profile",
    },
];
