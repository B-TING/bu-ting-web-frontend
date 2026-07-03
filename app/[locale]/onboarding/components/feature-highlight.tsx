import {
  BookOpenText,
  Building2,
  CalendarDays,
  CloudOff,
  Luggage,
  MapPin,
  Navigation,
  PartyPopper,
  RefreshCw,
  Utensils,
} from 'lucide-react';

import { FEATURE_STEPS } from '@/features/onboarding/constants/onboarding';

const ICONS = {
  calendar: CalendarDays,
  pin: MapPin,
  sync: RefreshCw,
  offline: CloudOff,
  luggage: Luggage,
  building: Building2,
  food: Utensils,
  party: PartyPopper,
  navigation: Navigation,
  book: BookOpenText,
};

export function FeatureHighlight({
  featureIndex,
  selectedCards,
}: {
  featureIndex: number;
  selectedCards: number[];
}) {
  const feature = FEATURE_STEPS[featureIndex];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {feature.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
        {feature.description}
      </p>

      <div className="mt-8 space-y-4">
        {feature.cards.map(([icon, title, description], index) => {
          const Icon = ICONS[icon];
          const selected = selectedCards.includes(index);

          return (
            <div
              key={title}
              className={`w-full rounded-2xl border-2 p-6 text-left transition ${
                selected
                  ? 'border-sky-600 bg-sky-50 shadow-sm'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <Icon
                className={selected ? 'text-sky-700' : 'text-slate-500'}
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
