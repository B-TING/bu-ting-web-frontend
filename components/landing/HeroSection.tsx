import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden bg-slate-900 px-6 py-14 sm:min-h-[520px] sm:px-10">
      <Image
        src="/home/thumbnail.png"
        alt="부산 도심 전경"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />

      <div className="relative z-10 flex flex-col gap-4">
        <span className="text-base font-semibold text-blue-200">
          계획부터 여기까지, 여행이 쉬워지는
        </span>
        <h1 className="text-3xl font-bold leading-snug text-white sm:text-4xl">
          부산을 아는 여행 앱
          <br />
          부팅
        </h1>
        <Link
          href="/trips/new"
          className="mt-3 inline-flex w-fit rounded-full bg-blue-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-400"
        >
          여행 시작하기
        </Link>
      </div>
    </section>
  );
}
