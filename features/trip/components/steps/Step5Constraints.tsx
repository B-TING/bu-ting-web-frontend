'use client';

import OptionButton from '../OptionButton';
import type { TravelConstraint, TripWizardData } from '@/types/tripWizard';

const OPTIONS: { value: TravelConstraint; description?: string }[] = [
  { value: '짐이 많음', description: '캐리어 또는 대형 짐' },
  { value: '짐이 적음', description: '백팩 또는 소형 짐' },
  { value: '애완동물 동반', description: '반려동물 동반 여행' },
  { value: '유모차', description: '영아·유아 동반' },
  { value: '휠체어·접근성', description: '배리어 프리 장소 우선' },
  { value: '식단·알레르기', description: '특정 음식 제한' },
  { value: '없음', description: '해당 사항 없음' },
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step5Constraints({ data, onChange }: Props) {
  const toggle = (option: TravelConstraint) => {
    if (option === '없음') {
      const isNoneSelected = data.constraints.includes('없음');
      onChange({ constraints: isNoneSelected ? [] : ['없음'] });
      return;
    }

    const withoutNone = data.constraints.filter((v) => v !== '없음');
    const next = withoutNone.includes(option)
      ? withoutNone.filter((v) => v !== option)
      : [...withoutNone, option];
    onChange({ constraints: next });
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {OPTIONS.map(({ value, description }) => (
        <OptionButton
          key={value}
          label={value}
          description={description}
          selected={data.constraints.includes(value)}
          onClick={() => toggle(value)}
        />
      ))}
    </div>
  );
}
