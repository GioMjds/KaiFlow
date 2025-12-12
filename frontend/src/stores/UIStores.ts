import { create } from "zustand";

interface States {
    isSidebarOpen: boolean;
}

interface Actions {
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<States & Actions>((set) => ({
    isSidebarOpen: false,
    setIsSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
}));