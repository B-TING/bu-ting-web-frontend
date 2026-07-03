import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

import { FestivalLocationMap } from '@/app/[locale]/festivals/[festivalId]/components/festival-location-map';
import type { FestivalDetailView, FestivalResolvedView } from '@/types/festival';

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

function formatApiDate(value: string) {
  if (!/^\d{8}$/.test(value)) {
    return value;
  }

  return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
}

function toNullableNumber(value?: string | number | null) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveFestivalView(festival: FestivalDetailView): FestivalResolvedView {
  const { summary, detail } = festival;
  const details = detail.details ?? {};

  return {
    ...festival,
    resolvedPosterImage:
      summary?.imageUrl ||
      summary?.thumbnailUrl ||
      details.firstimage ||
      details.firstimage2 ||
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
    return `${formatApiDate(summary.eventStartDate)} - ${formatApiDate(summary.eventEndDate)}`;
  }

  if (detail.details?.eventstartdate && detail.details?.eventenddate) {
    return `${formatApiDate(detail.details.eventstartdate)} - ${formatApiDate(detail.details.eventenddate)}`;
  }

  return '\uC77C\uC815 \uC815\uBCF4 \uC5C6\uC74C';
}

function prettifyDetailLabel(key: string) {
  const labels: Record<string, string> = {
    eventplace: '\uD589\uC0AC \uC7A5\uC18C',
    playtime: '\uC6B4\uC601 \uC2DC\uAC04',
    sponsor1: '\uC8FC\uCD5C',
    sponsor1tel: '\uC8FC\uCD5C \uC5F0\uB77D\uCC98',
    sponsor2: '\uC8FC\uAD00',
    sponsor2tel: '\uC8FC\uAD00 \uC5F0\uB77D\uCC98',
    usetimefestival: '\uC774\uC6A9 \uC694\uAE08',
    bookingplace: '\uC608\uB9E4\uCC98',
    homepage: '\uD648\uD398\uC774\uC9C0',
    subevent: '\uBD80\uB300 \uD589\uC0AC',
    program: '\uD504\uB85C\uADF8\uB7A8',
  };

  return labels[key.toLowerCase()] ?? key;
}

function renderDetailValue(key: string, value: string) {
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

export function FestivalDetail({ festival }: { festival: FestivalDetailView }) {
  const resolvedFestival = resolveFestivalView(festival);
  const { summary, detail } = resolvedFestival;
  const posterImage = resolvedFestival.resolvedPosterImage;
  const detailEntries = getNormalizedDetailEntries(resolvedFestival);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/festivals"
            aria-label={'\uCD95\uC81C \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30'}
            className="flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-50"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-sky-700">Festival Detail</p>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
              {summary?.title ?? '\uCD95\uC81C \uC0C1\uC138 \uC815\uBCF4'}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-sm font-semibold text-sky-700">Poster</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {'\uD3EC\uC2A4\uD130'}
              </h2>
            </div>

            <div className="bg-slate-100">
              {posterImage ? (
                <img
                  src={posterImage}
                  alt={summary?.title ?? '\uCD95\uC81C \uD3EC\uC2A4\uD130'}
                  className="block h-auto w-full"
                />
              ) : (
                <div className="flex min-h-[520px] items-center justify-center text-sm font-semibold text-slate-400">
                  {'\uD3EC\uC2A4\uD130 \uC774\uBBF8\uC9C0 \uC5C6\uC74C'}
                </div>
              )}
            </div>
          </article>

          <FestivalLocationMap festival={resolvedFestival} />
        </section>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-6">
            <p className="text-sm font-semibold text-sky-700">Detail</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {'\uCD95\uC81C \uC0C1\uC138 \uC815\uBCF4'}
            </h2>
          </div>

          {detailEntries.length > 0 ? (
            <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {detailEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-2 px-4 py-4 sm:grid-cols-[180px_1fr] sm:px-5"
                >
                  <dt className="text-sm font-semibold text-slate-500">
                    {key === 'festivalPeriod'
                      ? '\uD589\uC0AC \uAE30\uAC04'
                      : prettifyDetailLabel(key)}
                  </dt>
                  <dd className="break-words text-sm leading-7 text-slate-800">
                    {key === 'festivalPeriod' ? value : renderDetailValue(key, value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-slate-500">
              {'\uD604\uC7AC \uC0C1\uC138 API\uC5D0\uC11C \uB0B4\uB824\uC628 \uCD94\uAC00 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.'}
            </div>
          )}

          {detail.googlePlace ? (
            <section className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sky-700">
                <Star className="size-5 fill-current" />
                <p className="text-sm font-semibold">
                  {'Google Places \uC815\uBCF4'}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-black text-slate-950">
                  {detail.googlePlace.rating.toFixed(1)}
                </p>
                <p className="pb-1 text-sm text-slate-500">
                  {`\uB9AC\uBDF0 ${detail.googlePlace.reviewCount.toLocaleString()}\uAC1C`}
                </p>
              </div>

              {detail.googlePlace.openingHours?.length ? (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <h3 className="font-bold text-slate-900">
                    {'\uC6B4\uC601 \uC2DC\uAC04'}
                  </h3>
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
