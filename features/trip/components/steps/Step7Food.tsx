'use client';

import OptionButton from '../OptionButton';
import type { FoodPreference, TripWizardData } from '@/types/tripWizard';

const OPTIONS: FoodPreference[] = [
  '밀면',
  '돼지국밥',
  '해물탕·회',
  '어묵·부산 간식',
  '팥빙수·디저트',
  '치맥·야식',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step7Food({ data, onChange }: Props) {
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
          label={option}
          selected={data.foods.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
