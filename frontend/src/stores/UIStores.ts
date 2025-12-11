import { create } from "zustand";

interface States {
    isSidebarOpen: boolean;
}

interface Actions {
    toggleSidebar: () => void;
}

export const useUIStore = create<States & Actions>((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));