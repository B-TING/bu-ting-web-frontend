import { ChevronDown, Luggage, BookImage, Map, CalendarDays } from "lucide-react";

const FEATURES = [
  {
    icon: Luggage,
    title: "짐 보관소",
    description: "여행 중 짐 걱정은 이제 그만. 부산 곳곳의 짐 보관소를 한눈에 확인하세요.",
  },
  {
    icon: BookImage,
    title: "피드",
    description: "다른 여행자들의 생생한 부산 여행 후기와 꿀팁을 확인하세요.",
  },
  {
    icon: Map,
    title: "여행 생성",
    description: "내 일정에 맞는 부산 여행 코스를 직접 만들고 저장하세요.",
  },
  {
    icon: CalendarDays,
    title: "축제 캘린더",
    description: "부산의 다양한 축제와 이벤트 일정을 캘린더로 한눈에 확인하세요.",
  },
];

export default function Landing() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[calc(100vh-60px)] overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-blue-800">
        {/* 배경 장식 */}
        <div className="absolute top-[-80px] right-[-60px] w-[320px] h-[320px] rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="absolute bottom-[80px] left-[-80px] w-[280px] h-[280px] rounded-full bg-cyan-400/10 blur-3xl" />

        {/* 물결 패턴 (하단) */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 40 C360 80 1080 0 1440 40 L1440 80 L0 80 Z"
              fill="white"
              fillOpacity="0.05"
            />
            <path
              d="M0 55 C360 20 1080 70 1440 55 L1440 80 L0 80 Z"
              fill="white"
              fillOpacity="0.05"
            />
          </svg>
        </div>

        {/* 텍스트 */}
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
          <span className="text-xs font-semibold tracking-[0.25em] text-blue-300 uppercase">
            Busan Travel Planner
          </span>
          <h1 className="text-4xl font-bold text-white leading-tight">
            부산에서<br />
            <span className="text-cyan-300">즐겁게</span> 여행하자!
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-[260px]">
            바다, 음식, 축제까지<br />
            부팅과 함께 부산의 모든 순간을 계획하세요
          </p>
          <button className="mt-2 px-7 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold rounded-full text-sm transition-colors shadow-lg shadow-cyan-400/30">
            여행 시작하기
          </button>
        </div>

        {/* 스크롤 힌트 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-blue-300/60 animate-bounce">
          <span className="text-xs">스크롤</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-screen-md mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">Features</span>
            <h2 className="text-2xl font-bold text-gray-900">부팅으로 할 수 있는 것들</h2>
            <p className="text-sm text-gray-500">부산 여행을 더 쉽고 즐겁게 만들어드려요</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50"
              >
                <div className="flex-shrink-0 flex w-11 h-11 items-center justify-center rounded-xl bg-blue-100">
                  <Icon className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-900 text-sm">{title}</span>
                  <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 와이어프레임 미리보기 */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-screen-md mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Preview</span>
            <h2 className="text-2xl font-bold text-gray-900">이렇게 사용해요</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ title }) => (
              <div
                key={title}
                className="aspect-[4/3] rounded-2xl bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-8 h-1.5 rounded-full bg-gray-200" />
                <div className="w-14 h-1.5 rounded-full bg-gray-200" />
                <span className="text-xs text-gray-400 mt-1">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
