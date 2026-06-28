'use client';

import OptionButton from '../OptionButton';
import type { CompanionType, TripWizardData } from '@/types/tripWizard';

const OPTIONS: CompanionType[] = ['혼자', '가족', '애인·연인', '친구', '동료'];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step3CompanionType({ data, onChange }: Props) {
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
          label={option}
          selected={data.companionTypes.includes(option)}
          onClick={() => toggle(option)}
        />
      ))}
    </div>
  );
}
