import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Manager {
    _id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    role: any;
    status: string;
    assignedWarehouses?: any[];
}

interface AuthState {
    token: string | null;
    manager: Manager | null;
    setAuth: (token: string, manager: Manager) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            manager: null,
            setAuth: (token, manager) => set({ token, manager }),
            clearAuth: () => set({ token: null, manager: null }),
            isAuthenticated: () => !!get().token,
        }),
        {
            name: "delivery-auth-storage",
        }
    )
);
