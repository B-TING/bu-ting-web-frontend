'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { FoodPreference, TripWizardData } from '@/types/tripWizard';

const OPTIONS: FoodPreference[] = [
  'milmyeon',
  'dwaeji_gukbap',
  'haemul_hoe',
  'eomuk',
  'patbingsu',
  'chimaek',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step7Food({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.food');

  const toggle = (option: FoodPreference) => {
    const current = data.foods;
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onChange({ foods: next });
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={t(option)}
          selected={data.foods.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
