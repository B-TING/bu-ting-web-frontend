'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { isPublicPath } from '@/lib/auth-routes';

export function AuthRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!hasHydrated || accessToken || isPublicPath(pathname)) return;
    router.replace('/auth/login');
  }, [hasHydrated, accessToken, pathname, router]);

  return null;
}
