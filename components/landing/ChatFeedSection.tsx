const CORNER_TAGS = [
  {
    tag: '#짐보관',
    text: '근처에 짐 맡길 곳 있을까요?',
    position: 'sm:left-0 sm:top-10',
  },
  {
    tag: '#현지정보',
    text: '전포 카페거리 웨이팅 짧아졌대요!',
    position: 'sm:right-0 sm:top-10',
  },
  {
    tag: '#여행질문',
    text: '광안리 야경 몇 시가 제일 예쁜가요?',
    position: 'sm:left-0 sm:bottom-10',
  },
  {
    tag: '#긴급상황',
    text: '근처 약국 문 연 곳 아시는 분?',
    position: 'sm:right-0 sm:bottom-10',
  },
];

function ChatBubbleCard() {
  return (
    <div className="w-64 rounded-2xl bg-white p-4 shadow-xl sm:w-72">
      <p className="text-sm font-medium leading-snug text-gray-900">
        부산 · 9,532명이 여행중이에요
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <div className="w-fit max-w-[85%] rounded-xl rounded-tl-sm bg-gray-100 px-3.5 py-2 text-sm font-medium leading-snug text-gray-700">
          해운대 왔는데 이 시간에 문 연 국밥집 있나요?
        </div>
        <div className="ml-auto w-fit max-w-[85%] rounded-xl rounded-tr-sm bg-blue-600 px-3.5 py-2 text-sm font-medium leading-snug text-white">
          역 바로 앞에 24시간 하는 곳 있어요!
        </div>
        <div className="w-fit max-w-[85%] rounded-xl rounded-tl-sm bg-gray-100 px-3.5 py-2 text-sm font-medium leading-snug text-gray-700">
          감사합니다 :)
        </div>
      </div>
    </div>
  );
}

export default function ChatFeedSection() {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-base font-semibold text-blue-500">피드</span>
          <h2 className="text-2xl font-bold leading-snug text-gray-900">
            내가 가려는 그곳,
            <br />
            지금 상황 어떤가요?
          </h2>
          <p className="max-w-md text-base font-medium leading-relaxed text-gray-500">
            여행 중에도 내가 여행하는 곳의 유용한 정보와 현지 상황을 다른 여행자들과 공유해 보세요.
          </p>
        </div>

        {/* 모바일: 세로로 쌓기 */}
        <div className="flex flex-col items-center gap-6 sm:hidden">
          <div className="flex size-64 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <ChatBubbleCard />
          </div>
          <div className="grid w-full grid-cols-1 gap-3">
            {CORNER_TAGS.map((item) => (
              <div
                key={item.tag}
                className="flex flex-col gap-1.5"
              >
                <span className="text-sm font-medium text-blue-500">{item.tag}</span>
                <span className="w-fit rounded-xl rounded-tl-sm bg-amber-300 px-3.5 py-2 text-sm font-medium text-gray-900">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 데스크톱: 원 주위에 배치 */}
        <div className="relative hidden min-h-[420px] items-center justify-center py-10 sm:flex">
          {CORNER_TAGS.map((item) => (
            <div
              key={item.tag}
              className={`absolute flex w-56 flex-col gap-1.5 ${item.position}`}
            >
              <span className="text-sm font-medium text-blue-500">{item.tag}</span>
              <span className="w-fit rounded-xl rounded-tl-sm bg-amber-300 px-3.5 py-2 text-sm font-medium text-gray-900">
                {item.text}
              </span>
            </div>
          ))}

          <div className="flex size-72 shrink-0 items-center justify-center rounded-full bg-blue-600 sm:size-80">
            <ChatBubbleCard />
          </div>
        </div>
      </div>
    </section>
  );
}
