import Link from 'next/link';

import type { PreferenceRow } from '@/app/my/types';

interface TravelPreferenceCardProps {
  rows: PreferenceRow[];
  isLoading: boolean;
  errorMessage?: string;
}

export function TravelPreferenceCard({
  rows,
  isLoading,
  errorMessage,
}: TravelPreferenceCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">여행 취향</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        AI 추천과 일정 생성에 반영되는 설문 응답입니다.
      </p>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">여행 취향을 불러오는 중입니다.</p>
      ) : errorMessage ? (
        <p className="py-10 text-center text-sm text-red-600">{errorMessage}</p>
      ) : rows.length > 0 ? (
        <dl className="mt-6 space-y-5 text-sm">
          {rows.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-slate-400">{label}</dt>
              <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="py-10 text-center text-sm leading-6 text-slate-500">
          저장된 여행 취향이 없습니다.<br />취향을 설정하면 맞춤 추천에 활용할 수 있어요.
        </p>
      )}

      <Link
        href="/my/preferences"
        className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-sky-700 text-base font-bold text-white hover:bg-sky-800"
      >
        취향 다시 설정
      </Link>
    </section>
  );
}
