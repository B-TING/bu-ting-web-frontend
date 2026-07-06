import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

import { FestivalLocationMap } from '@/app/[locale]/festivals/[festivalId]/components/festival-location-map';
import { formatCompactDate } from '@/lib/utils';
import type {
  FestivalDetailPageContext,
  FestivalDetailView,
  FestivalResolvedView,
} from '@/types/festival';

function getFestivalPosterFallback(contentId?: string | null) {
  const fallbackPosters: Record<string, string> = {
    '2486085': 'https://tong.visitkorea.or.kr/cms/resource/18/4080818_image2_1.jpg',
    '4080156': 'https://tong.visitkorea.or.kr/cms/resource/87/4080287_image2_1.jpg',
    '4077756': 'https://tong.visitkorea.or.kr/cms/resource/57/4077757_image2_1.jpg',
    '3497353': 'https://tong.visitkorea.or.kr/cms/resource/73/4070173_image2_1.jpg',
    '4055637': 'https://tong.visitkorea.or.kr/cms/resource/26/4055726_image2_1.jpeg',
    '2523149': 'https://tong.visitkorea.or.kr/cms/resource/66/4059066_image2_1.jpg',
    '2786391': 'https://tong.visitkorea.or.kr/cms/resource/12/3518612_image2_1.jpeg',
  };

  if (!contentId) {
    return null;
  }

  return fallbackPosters[contentId] ?? null;
}

function toNullableNumber(value?: string | number | null) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveFestivalView(
  festival: FestivalDetailView,
  pageContext?: FestivalDetailPageContext,
): FestivalResolvedView {
  const { summary, detail } = festival;
  const details = detail.details ?? {};

  return {
    ...festival,
    resolvedPosterImage:
      summary?.imageUrl ||
      summary?.thumbnailUrl ||
      details.firstimage ||
      details.firstimage2 ||
      pageContext?.posterImage ||
      getFestivalPosterFallback(summary?.contentId ?? detail.contentId) ||
      null,
    resolvedAddress:
      summary?.address ||
      details.addr1 ||
      details.address ||
      details.eventplace ||
      null,
    resolvedLatitude:
      summary?.latitude ??
      toNullableNumber(details.mapy) ??
      toNullableNumber(details.latitude) ??
      null,
    resolvedLongitude:
      summary?.longitude ??
      toNullableNumber(details.mapx) ??
      toNullableNumber(details.longitude) ??
      null,
  };
}

function getFestivalPeriod(festival: FestivalResolvedView) {
  const { summary, detail } = festival;

  if (summary?.eventStartDate && summary?.eventEndDate) {
    return `${formatCompactDate(summary.eventStartDate)} - ${formatCompactDate(summary.eventEndDate)}`;
  }

  if (detail.details?.eventstartdate && detail.details?.eventenddate) {
    return `${formatCompactDate(detail.details.eventstartdate)} - ${formatCompactDate(detail.details.eventenddate)}`;
  }

  return '일정 정보 없음';
}

function prettifyDetailLabel(key: string) {
  const labels: Record<string, string> = {
    eventplace: '행사 장소',
    playtime: '운영 시간',
    sponsor1: '주최',
    sponsor1tel: '주최 연락처',
    sponsor2: '주관',
    sponsor2tel: '주관 연락처',
    usetimefestival: '이용 요금',
    bookingplace: '예매처',
    homepage: '홈페이지',
    subevent: '부대 행사',
    program: '프로그램',
    agelimit: '연령 제한',
    usetime: '이용 시간',
    discountinfofestival: '할인 정보',
    eventhomepage: '행사 홈페이지',
  };

  return labels[key.toLowerCase()] ?? key;
}

function renderDetailValue(key: string, value: string) {
  if (['program', 'subevent'].includes(key.toLowerCase())) {
    const lines = value
      .split(/\s+-\s+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => (line.startsWith('-') ? line : `- ${line}`));

    return (
      <div className="space-y-1 whitespace-pre-line">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    );
  }

  if (/^https?:\/\//.test(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-sky-700 underline underline-offset-4"
      >
        {value}
      </a>
    );
  }

  return value;
}

function getNormalizedDetailEntries(festival: FestivalResolvedView) {
  const details = festival.detail.details ?? {};
  const entries = Object.entries(details).filter(
    ([, value]) => value != null && value.trim() !== '',
  );

  const filteredEntries = entries.filter(([key]) => {
    const normalizedKey = key.toLowerCase();

    return ![
      'eventstartdate',
      'eventenddate',
      'contentid',
      'firstimage',
      'firstimage2',
      'mapx',
      'mapy',
      'latitude',
      'longitude',
      'progresstype',
    ].includes(normalizedKey);
  });

  return [['festivalPeriod', getFestivalPeriod(festival)], ...filteredEntries];
}

export function FestivalDetail({
  festival,
  pageContext,
}: {
  festival: FestivalDetailView;
  pageContext?: FestivalDetailPageContext;
}) {
  const resolvedFestival = resolveFestivalView(festival, pageContext);
  const { summary, detail } = resolvedFestival;
  const posterImage = resolvedFestival.resolvedPosterImage;
  const detailEntries = getNormalizedDetailEntries(resolvedFestival);
  const backHref = pageContext?.month
    ? `/festivals?month=${pageContext.month}`
    : '/festivals';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            aria-label="축제 목록으로 돌아가기"
            className="flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-50"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-sky-700">축제 상세</p>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
              {summary?.title ?? '축제 상세 정보'}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-sm font-semibold text-sky-700">포스터</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">포스터</h2>
            </div>

            <div className="bg-slate-100">
              {posterImage ? (
                <img
                  src={posterImage}
                  alt={summary?.title ?? '축제 포스터'}
                  className="block h-auto w-full"
                />
              ) : (
                <div className="flex min-h-[520px] items-center justify-center text-sm font-semibold text-slate-400">
                  포스터 이미지 없음
                </div>
              )}
            </div>
          </article>

          <FestivalLocationMap festival={resolvedFestival} />
        </section>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-6">
            <p className="text-sm font-semibold text-sky-700">상세 정보</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">축제 상세 정보</h2>
          </div>

          {detailEntries.length > 0 ? (
            <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {detailEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-2 px-4 py-4 sm:grid-cols-[180px_1fr] sm:px-5"
                >
                  <dt className="text-sm font-semibold text-slate-500">
                    {key === 'festivalPeriod' ? '행사 기간' : prettifyDetailLabel(key)}
                  </dt>
                  <dd className="break-words text-sm leading-7 text-slate-800">
                    {key === 'festivalPeriod' ? value : renderDetailValue(key, value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-slate-500">
              현재 상세 API에서 내려온 추가 정보가 없습니다.
            </div>
          )}

          {detail.googlePlace ? (
            <section className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sky-700">
                <Star className="size-5 fill-current" />
                <p className="text-sm font-semibold">Google Places 정보</p>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-black text-slate-950">
                  {detail.googlePlace.rating.toFixed(1)}
                </p>
                <p className="pb-1 text-sm text-slate-500">
                  {`리뷰 ${detail.googlePlace.reviewCount.toLocaleString()}개`}
                </p>
              </div>

              {detail.googlePlace.openingHours?.length ? (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <h3 className="font-bold text-slate-900">운영 시간</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {detail.googlePlace.openingHours.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}
        </article>
      </div>
    </main>
  );
}
