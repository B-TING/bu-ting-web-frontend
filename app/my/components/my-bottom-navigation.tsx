import { CalendarDays, House, NotebookTabs, UserRound } from 'lucide-react';
import Link from 'next/link';

import type { MyNavigationItem } from '@/app/my/types';

const ITEMS: MyNavigationItem[] = [
  { label: '홈', href: '/', icon: House },
  { label: '일정', href: '/trips', icon: CalendarDays },
  { label: '기록', href: '/stories', icon: NotebookTabs },
  { label: '마이', href: '/my', icon: UserRound },
];

export function MyBottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white">
      <div className="mx-auto grid h-17 max-w-3xl grid-cols-4">
        {ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === '/my';
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-semibold ${
                active ? 'text-sky-700' : 'text-slate-400'
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
