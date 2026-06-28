'use client';

import OptionButton from '../OptionButton';
import type { Attraction, TripWizardData } from '@/types/tripWizard';

const OPTIONS: Attraction[] = [
  '감천문화마을',
  '해운대 해수욕장',
  '광안리',
  '태종대',
  '자갈치시장',
  '해동용궁사',
  '송정 해수욕장',
  '황령산 봉수대',
  '용두산 공원',
  '범어사',
  '영도 절영로',
  '부산현대미술관',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step6Attractions({ data, onChange }: Props) {
  const toggle = (option: Attraction) => {
    const current = data.attractions;
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onChange({ attractions: next });
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={option}
          selected={data.attractions.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
