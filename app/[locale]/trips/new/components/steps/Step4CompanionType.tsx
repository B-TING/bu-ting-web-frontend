'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { CompanionType, TripWizardData } from '@/types/tripWizard';

const OPTIONS: CompanionType[] = ['solo', 'family', 'couple', 'friends', 'colleagues'];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step4CompanionType({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.companionType');

  return (
    <div className="space-y-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={t(option)}
          selected={data.companionType === option}
          onClick={() => onChange({ companionType: option })}
        />
      ))}
    </div>
  );
}
