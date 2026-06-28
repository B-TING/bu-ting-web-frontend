'use client';

import OptionButton from '../OptionButton';
import type { GenerationMethod, TripWizardData } from '@/types/tripWizard';

const OPTIONS: { value: GenerationMethod; label: string; description: string }[] = [
  {
    value: 'ai',
    label: 'AI가 일정 생성',
    description: '입력한 정보로 바로 플랜을 짬',
  },
  {
    value: 'manual',
    label: '후보에서 직접 선택',
    description: 'AI 후보를 보고 마음에 드는 플랜 선택',
  },
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step9GenerationMethod({ data, onChange }: Props) {
  return (
    <div className="space-y-3">
      {OPTIONS.map(({ value, label, description }) => (
        <OptionButton
          key={value}
          label={label}
          description={description}
          selected={data.generationMethod === value}
          onClick={() => onChange({ generationMethod: value })}
        />
      ))}
    </div>
  );
}
