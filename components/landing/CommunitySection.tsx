import { Luggage, Timer, Zap } from 'lucide-react';

const LUGGAGE_SPOTS = [
  { name: '해운대역 2번 출구', detail: '대형 캐리어 가능' },
  { name: '서면역 1번 출구', detail: '소형 짐 전용' },
  { name: '남포동 국제시장 앞', detail: '대형 캐리어 가능' },
];

function EventCard() {
  return (
    <div className="rounded-2xl bg-rose-50 p-5">
      <h4 className="flex items-center gap-1.5 text-sm font-medium leading-snug text-rose-600">
        <Zap className="size-5 fill-rose-500 text-rose-500" />
        해운대 해변 인증
      </h4>
      <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
        해운대 해수욕장에서 바다를 배경으로 사진을 찍어 인증하세요.
      </p>
      <p className="mt-2 flex items-center gap-1 text-sm font-medium text-rose-500">
        <Timer className="size-4" />
        남은 시간 6일 23시간 47분
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <div className="w-fit max-w-[85%] rounded-xl rounded-tl-sm bg-amber-300 px-3.5 py-2 text-sm font-medium text-gray-900">
          지금 해운대 해수욕장에서 사진 찍어주실 분 계신가요?
        </div>
        <div className="ml-auto w-fit max-w-[85%] rounded-xl rounded-tr-sm bg-blue-600 px-3.5 py-2 text-sm font-medium text-white">
          제가 찍어드릴게요!
        </div>
      </div>
    </div>
  );
}

function LuggageCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-medium leading-snug text-gray-900">
        짐 걱정 없는, 홀가분한 하루
      </h4>
      <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
        여행 중 짐 걱정은 이제 그만. 부산 곳곳의 짐 보관소 위치를 한눈에 확인하세요.
      </p>

      <ul className="mt-4 flex flex-col divide-y divide-gray-100">
        {LUGGAGE_SPOTS.map((spot) => (
          <li
            key={spot.name}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Luggage className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium leading-snug text-gray-900">
                {spot.name}
              </span>
              <span className="block text-sm font-medium leading-snug text-gray-400">
                {spot.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CommunitySection() {
  return (
    <section className="bg-gray-50 px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto grid max-w-screen-md grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="text-base font-semibold text-blue-500">지역 이벤트 · 데이터 활용</span>
          <h2 className="text-2xl font-bold leading-snug text-gray-900">
            우리가 함께 만드는
            <br />
            부산 여행이 궁금할까요?
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <EventCard />
          <LuggageCard />
        </div>
      </div>
    </section>
  );
}
