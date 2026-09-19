import Image from 'next/image';

const FESTIVALS = [
  {
    name: '부산불꽃축제',
    period: '10월 · 광안리',
    image: '/home/busan-fireworks-festival.jpeg',
  },
  {
    name: '자갈치축제',
    period: '10월 · 자갈치시장',
    image: '/home/jagalchi-festival.jpeg',
  },
  {
    name: '광안리어방축제',
    period: '5월 · 광안리',
    image: '/home/gwangalli-eobang-festival.jpg',
  },
  {
    name: '전포골목축제',
    period: '9월 · 부산진구',
    image: '/home/jeonpo-festival.jpg',
  },
];

export default function FestivalCalendarSection() {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-screen-lg flex-col gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-base font-semibold text-blue-500">축제 캘린더</span>
          <h2 className="text-2xl font-bold leading-snug text-gray-900">
            부산의 사계절,
            <br />
            놓치지 않도록
          </h2>
          <p className="max-w-md text-base font-medium leading-relaxed text-gray-500">
            꽃놀이축제부터 동네 골목축제까지, 부산에서 열리는 축제와 이벤트를 달력 한 곳에서
            확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FESTIVALS.map((festival) => (
            <div
              key={festival.name}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100"
            >
              <Image
                src={festival.image}
                alt={festival.name}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-base font-bold leading-snug text-white">{festival.name}</p>
                <p className="text-base font-medium leading-snug text-white/80">
                  {festival.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
