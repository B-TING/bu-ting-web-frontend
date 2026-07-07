import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { OAuthLoginPanel } from '../components/oauth-login-panel';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="hidden w-1/2 flex-col justify-between bg-sky-950 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
            <MapPin className="size-5 text-sky-300" aria-hidden="true" />
          </span>
          B-TING
        </Link>

        <div className="max-w-lg">
          <p className="mb-5 text-sm font-semibold tracking-[0.2em] text-sky-300">
            BUSAN TRAVEL PLANNER
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            다시 만나서 반가워요!
          </h1>
          <p className="mt-6 text-lg leading-8 text-sky-100/80">
            간편 로그인으로 부산 여행 계획을 이어가 보세요.
          </p>
        </div>

        <p className="text-sm text-sky-100/60">© 2026 B-TING</p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 flex items-center justify-center gap-2 text-xl font-semibold text-sky-950 lg:hidden"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-100">
              <MapPin className="size-5 text-sky-700" aria-hidden="true" />
            </span>
            B-TING
          </Link>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              로그인
            </h2>
            <p className="mt-3 text-slate-500">
              일정 동기화와 Route Feed를 위해 로그인하세요.
            </p>
          </div>

          <OAuthLoginPanel />

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            로그인하면 B-TING 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </section>
    </main>
  );
}
