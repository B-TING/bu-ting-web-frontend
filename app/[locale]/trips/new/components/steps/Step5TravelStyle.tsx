'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { TravelStyle, TripWizardData } from '@/types/tripWizard';

const OPTIONS: TravelStyle[] = [
  'culture_history',
  'nature_healing',
  'food_dining',
  'shopping',
  'activities',
  'photo_insta',
  'night_view',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step5TravelStyle({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.travelStyle');

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={t(option)}
          selected={data.travelStyle === option}
          onClick={() => onChange({ travelStyle: option })}
        />
      ))}
    </div>
  );
}
