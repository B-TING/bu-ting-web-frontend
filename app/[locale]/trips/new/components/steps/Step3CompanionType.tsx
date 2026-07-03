'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { CompanionType, TripWizardData } from '@/types/tripWizard';

const OPTIONS: CompanionType[] = ['solo', 'family', 'couple', 'friends', 'colleagues'];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step3CompanionType({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.companionType');

  const toggle = (option: CompanionType) => {
    const current = data.companionTypes;
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onChange({ companionTypes: next });
  };

  return (
    <div className="space-y-2.5">
      {OPTIONS.map((option) => (
        <OptionButton
          key={option}
          label={t(option)}
          selected={data.companionTypes.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
