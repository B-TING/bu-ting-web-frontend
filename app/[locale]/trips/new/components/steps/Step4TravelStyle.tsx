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

export default function Step4TravelStyle({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.travelStyle');

  const toggle = (option: TravelStyle) => {
    const current = data.travelStyles;
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onChange({ travelStyles: next });
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={t(option)}
          selected={data.travelStyles.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
