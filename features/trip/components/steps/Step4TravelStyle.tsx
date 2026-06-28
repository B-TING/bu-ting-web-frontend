'use client';

import OptionButton from '../OptionButton';
import type { TravelStyle, TripWizardData } from '@/types/tripWizard';

const OPTIONS: TravelStyle[] = [
  '문화·역사',
  '자연·힐링',
  '미식·맛집',
  '쇼핑',
  '액티비티',
  '사진·인스타',
  '야경·나이트',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step4TravelStyle({ data, onChange }: Props) {
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
          label={option}
          selected={data.travelStyles.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
