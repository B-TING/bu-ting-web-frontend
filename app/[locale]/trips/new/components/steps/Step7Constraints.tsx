'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { TravelConstraint, TripWizardData } from '@/types/tripWizard';

const OPTIONS: TravelConstraint[] = [
  'heavy_luggage',
  'light_luggage',
  'pet',
  'stroller',
  'wheelchair',
  'diet_allergy',
  'none',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step7Constraints({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.constraint');

  const toggle = (option: TravelConstraint) => {
    if (option === 'none') {
      const isNoneSelected = data.constraints.includes('none');
      onChange({ constraints: isNoneSelected ? [] : ['none'] });
      return;
    }
    const withoutNone = data.constraints.filter((v) => v !== 'none');
    const next = withoutNone.includes(option)
      ? withoutNone.filter((v) => v !== option)
      : [...withoutNone, option];
    onChange({ constraints: next });
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={t(option)}
          description={t(`${option}_desc`)}
          selected={data.constraints.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
