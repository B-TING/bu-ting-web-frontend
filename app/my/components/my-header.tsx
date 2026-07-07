'use client';

import { Menu, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function MyHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          >
            <Menu className="size-6" />
          </button>
          <Link href="/" className="text-lg font-black tracking-tight text-slate-950">
            BU-TING
          </Link>
          <span className="flex size-10 items-center justify-center rounded-full bg-slate-100">
            <UserRound className="size-5 text-slate-700" />
          </span>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <strong className="text-lg">BU-TING</strong>
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={() => setMenuOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-2">
              <Link href="/" className="rounded-xl px-3 py-3 hover:bg-slate-100">홈</Link>
              <Link href="/trips" className="rounded-xl px-3 py-3 hover:bg-slate-100">여행 일정</Link>
              <Link href="/stories" className="rounded-xl px-3 py-3 hover:bg-slate-100">여행 기록</Link>
              <Link href="/my" className="rounded-xl bg-sky-50 px-3 py-3 font-semibold text-sky-800">마이페이지</Link>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
