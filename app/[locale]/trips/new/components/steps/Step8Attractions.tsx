'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { Attraction, TripWizardData } from '@/types/tripWizard';

const OPTIONS: Attraction[] = [
  'gamcheon',
  'haeundae',
  'gwangalli',
  'taejongdae',
  'jagalchi',
  'haedong',
  'songjeong',
  'hwangnyeong',
  'yongdusan',
  'beomeosa',
  'yeongdo',
  'moca',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step8Attractions({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.attraction');

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
          label={t(option)}
          selected={data.attractions.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
