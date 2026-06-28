'use client';

import { X } from 'lucide-react';

const NAV_ITEMS = [
  { label: '짐 보관소', href: '/luggage' },
  { label: '피드', href: '/feed' },
  { label: '여행 생성', href: '/trips/new' },
  { label: '축제 캘린더', href: '/festival' },
];

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationSidebar({ isOpen, onClose }: NavigationSidebarProps) {
  const isLoggedIn = false; // TODO: 인증 상태 연결

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-4 border-b">
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 border-b">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <span className="font-medium text-gray-800">사용자 이름</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button className="flex-1 py-2 text-center border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                로그인
              </button>
              <button className="flex-1 py-2 text-center bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                회원가입
              </button>
            </div>
          )}
        </div>

        <nav className="p-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
