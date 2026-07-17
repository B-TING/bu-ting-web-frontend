'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface StoryImageCarouselProps {
  images: string[];
  title: string;
  aspectClassName?: string;
}

export function StoryImageCarousel({
  images,
  title,
  aspectClassName = 'aspect-[16/10]',
}: StoryImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeImages = useMemo(() => (images.length > 0 ? images : []), [images]);

  const currentImage = safeImages[currentIndex];

  if (!currentImage) {
    return (
      <div
        className={[
          'flex items-center justify-center rounded-3xl bg-slate-100 text-sm font-semibold text-slate-400',
          aspectClassName,
        ].join(' ')}
      >
        이미지가 없어요.
      </div>
    );
  }

  const move = (direction: 'prev' | 'next') => {
    setCurrentIndex((previousIndex) => {
      if (direction === 'prev') {
        return previousIndex === 0 ? safeImages.length - 1 : previousIndex - 1;
      }

      return previousIndex === safeImages.length - 1 ? 0 : previousIndex + 1;
    });
  };

  return (
    <div className={['relative overflow-hidden rounded-3xl bg-slate-100', aspectClassName].join(' ')}>
      <img src={currentImage} alt={title} className="h-full w-full object-cover" />

      {safeImages.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={() => move('prev')}
            className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={() => move('next')}
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-4 right-4 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white">
            {currentIndex + 1}/{safeImages.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
