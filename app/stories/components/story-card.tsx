import { Heart, MapPin, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';

import type { TravelStory } from '@/app/stories/types';

interface StoryCardProps {
  story: TravelStory;
}

export function StoryCard({ story }: StoryCardProps) {
  const cover = story.media.find((item) => item.imageUrl)?.imageUrl;

  return (
    <Link
      href={`/stories/${story.id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-200 bg-cover bg-center"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <span className="rounded-full bg-sky-500 px-3 py-1 text-[11px] font-extrabold tracking-wide">
              TRAVELOGUE
            </span>
            <h2 className="mt-3 text-2xl font-black">{story.title}</h2>
          </div>
          <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-bold backdrop-blur">
            {story.media.length}장
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-sky-600 font-black text-white">
            {story.author.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900">{story.author.name}</p>
            <p className="truncate text-xs text-slate-500">{story.publishedAt}</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-sky-700">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {story.rating}점
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {story.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-sky-600" />
            {story.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="size-4 text-rose-500" />
            {story.helpfulCount}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="size-4 text-slate-400" />
            {story.comments.length}
          </span>
        </div>
      </div>
    </Link>
  );
}
