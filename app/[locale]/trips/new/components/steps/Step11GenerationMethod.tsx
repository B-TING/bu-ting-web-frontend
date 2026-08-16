'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { GenerationMethod, TripWizardData } from '@/types/tripWizard';

const OPTIONS: GenerationMethod[] = ['ai', 'manual'];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step11GenerationMethod({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.generation');

  return (
    <div className="space-y-3">
      {OPTIONS.map((value) => (
        <OptionButton
          key={value}
          label={t(`${value}_label`)}
          description={t(`${value}_desc`)}
          selected={data.generationMethod === value}
          onClick={() => onChange({ generationMethod: value })}
        />
      ))}
    </div>
  );
}
