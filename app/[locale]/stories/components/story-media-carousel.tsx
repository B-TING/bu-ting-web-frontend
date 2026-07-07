'use client';

import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

import type { StoryMedia } from '@/app/[locale]/stories/types';

interface StoryMediaCarouselProps {
  media: StoryMedia[];
  activeIndex: number;
  onChange: (index: number) => void;
}

function MapPreview({ item }: { item: StoryMedia }) {
  return (
    <div
      className="relative flex h-full min-h-[360px] items-center justify-center overflow-hidden bg-[#edf4e9]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(148,163,184,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.12) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }}
    >
      <div className="absolute left-[13%] top-[28%] h-1 w-[68%] rotate-12 rounded-full bg-amber-300" />
      <div className="absolute left-[45%] top-[10%] h-[75%] w-1 rotate-6 rounded-full bg-emerald-400" />
      {[
        ['24%', '30%', '1'],
        ['54%', '46%', '2'],
        ['76%', '27%', '3'],
      ].map(([left, top, label]) => (
        <div
          key={label}
          className="absolute flex size-10 items-center justify-center rounded-full border-4 border-white bg-sky-600 text-sm font-black text-white shadow-lg"
          style={{ left, top }}
        >
          {label}
        </div>
      ))}
      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 font-black text-slate-900">
          <MapPin className="size-5 text-sky-600" />
          {item.title}
        </div>
        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
      </div>
    </div>
  );
}

function CoverPreview({ item }: { item: StoryMedia }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 px-6 text-center">
      <span className="text-6xl" aria-hidden="true">🗺️</span>
      <p className="mt-5 text-2xl font-black text-slate-900">{item.title}</p>
      <p className="mt-2 text-sm text-slate-500">{item.description}</p>
    </div>
  );
}

export function StoryMediaCarousel({
  media,
  activeIndex,
  onChange,
}: StoryMediaCarouselProps) {
  const activeItem = media[activeIndex];
  const move = (direction: number) => {
    onChange((activeIndex + direction + media.length) % media.length);
  };

  return (
    <section className="relative overflow-hidden bg-slate-100" aria-label="여행 사진">
      <div className="aspect-[4/3] min-h-[360px] max-h-[680px] w-full">
        {activeItem.type === 'image' ? (
          <div
            className="relative h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${activeItem.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-20 text-white">
              <p className="text-xl font-black">{activeItem.title}</p>
              {activeItem.description ? (
                <p className="mt-1 text-sm text-white/85">{activeItem.description}</p>
              ) : null}
            </div>
          </div>
        ) : activeItem.type === 'map' ? (
          <MapPreview item={activeItem} />
        ) : (
          <CoverPreview item={activeItem} />
        )}
      </div>

      {media.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="이전 사진"
            onClick={() => move(-1)}
            className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            aria-label="다음 사진"
            onClick={() => move(1)}
            className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55"
          >
            <ChevronRight className="size-6" />
          </button>
          <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
            {activeIndex + 1}/{media.length}
          </span>
        </>
      ) : null}
    </section>
  );
}
