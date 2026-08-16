'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { TravelPace, TripWizardData } from '@/types/tripWizard';

const OPTIONS: TravelPace[] = ['relaxed', 'balanced', 'tight'];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step6TravelPace({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.pace');

  return (
    <div className="space-y-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={t(`${option}_label`)}
          description={t(`${option}_desc`)}
          selected={data.pace === option}
          onClick={() => onChange({ pace: option })}
        />
      ))}
    </div>
  );
}
