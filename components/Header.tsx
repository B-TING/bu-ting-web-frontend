'use client';

import { useState } from 'react';
import { Menu, UserRound } from 'lucide-react';

import NavigationSidebar from './NavigationSidebar';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = Boolean(accessToken);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between border-b border-gray-100 bg-white/90 px-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
              <span className="text-sm font-bold text-white">부팅</span>
            </div>
          </Link>
          {title && <h1 className="text-base font-bold text-gray-900 pl-2">{title}</h1>}
        </div>
        <div className="flex items-center gap-1.5">
          {isLoggedIn ? (
            <Link
              href="/my"
              aria-label="마이페이지"
              className="flex size-10 items-center justify-center overflow-hidden rounded-xl text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {user?.profileImageUrl && !profileImageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImageUrl}
                  alt={user.nickname || '프로필'}
                  onError={() => setProfileImageFailed(true)}
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center rounded-full bg-blue-50 w-9 h-9">
                  <UserRound className="size-5 " />
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-blue-50 bg-gray-100"
            >
              로그인
            </Link>
          )}
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </header>
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
