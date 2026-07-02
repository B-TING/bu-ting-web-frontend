'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import NavigationSidebar from './NavigationSidebar';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between border-b border-gray-100 bg-white/90 px-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
            <span className="text-sm font-bold text-white">부팅</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      </header>
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
