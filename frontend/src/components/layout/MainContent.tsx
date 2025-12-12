"use client";

import { motion } from "framer-motion";
import { useUIStore } from "@/stores/UIStores";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen } = useUIStore();

  return (
    <motion.main
      initial={{ marginLeft: 280 }}
      animate={{ marginLeft: isSidebarOpen ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-dvh"
    >
      {children}
    </motion.main>
  );
}
