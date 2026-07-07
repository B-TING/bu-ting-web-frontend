'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface StoryMediaCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function StoryMediaCarousel({
  images,
  alt,
  className,
}: StoryMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[activeIndex] : null;

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-slate-100 ${className ?? ''}`}>
      {currentImage ? (
        <img src={currentImage} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-3 text-slate-400">
          <ImageIcon className="h-10 w-10" />
          <p className="text-sm font-medium">등록된 이미지가 없어요.</p>
        </div>
      )}

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white"
            aria-label="다음 이미지"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white">
            {activeIndex + 1}/{images.length}
          </div>
        </>
      ) : null}
    </div>
  );
}

