'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/auth-store';

const NAV_ITEMS = [
  { label: '짐 보관소', href: '/luggage' },
  { label: '피드', href: '/stories' },
  { label: '여행 생성', href: '/trips/new' },
  { label: '축제 캘린더', href: '/festivals' },
];

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationSidebar({
  isOpen,
  onClose,
}: NavigationSidebarProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isLoggedIn = Boolean(accessToken);

  const handleLogout = () => {
    clearSession();
    onClose();
    router.replace('/auth/login');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end border-b p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="border-b p-4">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg bg-blue-500 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
            >
              로그아웃
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                로그인
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={onClose}
                className="flex-1 rounded-lg bg-blue-500 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>

        <nav className="p-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
