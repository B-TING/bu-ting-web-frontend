import Image from 'next/image';
import Link from 'next/link';

const STEPS = [
  { label: '흰여울문화마을 골목 산책', active: true },
  { label: '감천문화마을 포토 스팟', active: true },
  { label: '태종대 절벽 산책로', active: false },
  { label: '여유로운 동네 카페 투어', active: false },
];

const ITINERARY_PREVIEW = [
  {
    title: '흰여울문화마을',
    subtitle: '바다가 보이는 골목길',
    image: '/home/huinnyeoul-village.png',
  },
  {
    title: '감천문화마을',
    subtitle: '알록달록 산복도로 마을',
    image: '/home/gamcheon-village.png',
  },
  { title: '자갈치시장', subtitle: '싱싱한 제철 회 한 상', image: '/home/jagalchi-market.png' },
];

const STYLE_OPTIONS = [
  { label: '문화·역사', selected: false },
  { label: '자연·힐링', selected: false },
  { label: '미식·맛집', selected: true },
  { label: '쇼핑', selected: false },
  { label: '액티비티', selected: false },
  { label: '사진·인스타', selected: false },
  { label: '야경·나이트', selected: false },
];

function ItineraryPreviewCard() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-100">
      <ol className="divide-y divide-gray-100">
        {ITINERARY_PREVIEW.map((item, i) => (
          <li
            key={item.title}
            className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-snug text-gray-900">
                {item.title}
              </span>
              <span className="mt-0.5 block text-sm font-medium leading-snug text-gray-400">
                {item.subtitle}
              </span>
            </span>
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-blue-50">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TravelStyleQuizCard() {
  return (
    <div className="relative rounded-3xl border border-gray-100 bg-white p-5 pb-8 shadow-lg shadow-gray-100">
      <h4 className="text-sm font-medium leading-snug text-gray-900">선호하는 여행 스타일은?</h4>
      <p className="mt-1.5 text-sm font-medium text-gray-400">여행 테마 · 하나만 선택</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {STYLE_OPTIONS.map((option) => (
          <span
            key={option.label}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${
              option.selected
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <span
              className={`size-3.5 shrink-0 rounded-full border-2 ${
                option.selected ? 'border-white bg-white/30' : 'border-gray-300'
              }`}
            />
            {option.label}
          </span>
        ))}
      </div>

      <div className="absolute -bottom-5 right-4 w-[85%] rounded-2xl bg-gray-700/90 px-4 py-3 text-white shadow-lg">
        <p className="text-sm font-medium leading-snug">광안리, 1박 2일</p>
        <p className="mt-1 text-sm font-medium text-amber-300">추천 일정입니다.</p>
        <p className="mt-1 text-sm font-medium text-white/70">
          부팅이 취향에 맞춰 여행을 짜드렸어요.
        </p>
      </div>
    </div>
  );
}

export default function ScheduleShowcaseSection() {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-screen-md flex-col gap-16">
        <div className="flex flex-col gap-3">
          <span className="text-base font-semibold text-blue-500">일정 생성 · 관리</span>
          <h2 className="text-2xl font-bold leading-snug text-gray-900">
            나만의 부산 일정,
            <br />
            부팅으로 간편해졌어요
          </h2>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold leading-snug text-gray-900">
                여행을 한눈에, 그리고 한 번에!
              </h3>
              <p className="text-base font-medium leading-relaxed text-gray-500">
                다른 곳에서는 알 수 없었던 일이 부팅에서는 가능해요. 여행 전이든 여행 중이든 내가
                계획한 일정을 간편하게 수정하고 꺼내보세요.
              </p>
            </div>
            <ol className="flex flex-col gap-2">
              {STEPS.map((step, i) => (
                <li
                  key={step.label}
                  className={`flex items-center gap-2 text-sm font-medium ${
                    step.active ? 'text-gray-900' : 'text-gray-300'
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                      step.active ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </span>
                  {step.label}
                </li>
              ))}
            </ol>
            <Link
              href="/trips"
              className="inline-flex w-fit rounded-full bg-blue-500 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-blue-400"
            >
              일정 살펴보기
            </Link>
          </div>

          <ItineraryPreviewCard />
        </div>

        <div className="grid grid-cols-1 items-center gap-8 pb-4 sm:grid-cols-2 sm:gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold leading-snug text-gray-900">
                어떤 취향이든, 다 맞춰주니까
              </h3>
              <p className="text-base font-medium leading-relaxed text-gray-500">
                어떤 여행 취향이든 부팅에게 간단히 알려만 주세요. 부팅이 여러분의 취향에 꼭 맞는
                일정을 추천해 드립니다.
              </p>
            </div>
            <Link
              href="/trips/new"
              className="inline-flex w-fit rounded-full bg-blue-500 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-blue-400"
            >
              AI 일정 만들어보기
            </Link>
          </div>

          <TravelStyleQuizCard />
        </div>
      </div>
    </section>
  );
}
