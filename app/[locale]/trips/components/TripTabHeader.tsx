'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TripTabHeaderProps {
  tripTitle: string;
  tripId: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function TripTabHeader({
  tripTitle,
  tripId,
  backHref = '/',
  action,
}: TripTabHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations('trip.tabs');

  const tabs = [
    { key: 'overview', href: `/trips?travelId=${tripId}` },
    { key: 'itinerary', href: `/trips/${tripId}/itinerary` },
    { key: 'budget', href: `/trips/${tripId}/budget` },
    { key: 'records', href: `/trips/${tripId}/records` },
  ] as const;

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-gray-900">{tripTitle}</h1>
        </div>
        {action}
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <nav className="flex gap-6">
          {tabs.map(({ key, href }) => {
            const active = key === 'overview'
              ? pathname === '/trips'
              : pathname === href || pathname.endsWith(href);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'relative pb-3 text-sm font-medium transition-colors',
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
                )}
              >
                {t(key)}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
