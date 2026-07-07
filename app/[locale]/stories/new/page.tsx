import Link from 'next/link';

export default function StoryNewPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold text-sky-700">Story Writing</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">여행지 후기 작성은 일정에서 이어서 해 주세요</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          여행지 후기 입력은 여행 일정 안에서 방문 장소를 기준으로 이어지도록 설계할 예정이에요.
          지금은 여행기 피드와 상세 화면을 먼저 확인할 수 있도록 연결해 두었어요.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/stories"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            여행기 보기
          </Link>
          <Link
            href="/trips"
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            일정으로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
