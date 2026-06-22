"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import NavigationSidebar from "./NavigationSidebar";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex w-full bg-white/90 backdrop-blur-sm h-[60px] items-center justify-between px-4 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex w-9 h-9 items-center justify-center bg-blue-500 rounded-xl">
            <span className="text-white font-bold text-sm">부팅</span>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </header>
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
