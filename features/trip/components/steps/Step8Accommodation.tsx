'use client';

import OptionButton from '../OptionButton';
import type { AccommodationRegion, AccommodationStatus, TripWizardData } from '@/types/tripWizard';

const STATUS_OPTIONS: { value: AccommodationStatus; label: string; description: string }[] = [
  { value: 'booked', label: '숙소 예약 완료', description: '이미 숙소를 예약했어요' },
  { value: 'candidate', label: '숙소 후보 지역만', description: '아직 예약 전, 지역만 골랐어요' },
];

const REGION_OPTIONS: AccommodationRegion[] = [
  '해운대·마린시티',
  '서면·부전',
  '남포·중구',
  '광안리',
  '영도',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step8Accommodation({ data, onChange }: Props) {
  const toggleRegion = (region: AccommodationRegion) => {
    const current = data.accommodationRegions;
    const next = current.includes(region)
      ? current.filter((v) => v !== region)
      : [...current, region];
    onChange({ accommodationRegions: next });
  };

  const selectStatus = (status: AccommodationStatus) => {
    onChange({
      accommodationStatus: status,
      accommodationRegions: status === 'booked' ? [] : data.accommodationRegions,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {STATUS_OPTIONS.map(({ value, label, description }) => (
          <OptionButton
            key={value}
            label={label}
            description={description}
            selected={data.accommodationStatus === value}
            onClick={() => selectStatus(value)}
          />
        ))}
      </div>

      {data.accommodationStatus === 'candidate' && (
        <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-gray-500">선호 지역 선택 (복수 선택 가능)</p>
          <div className="grid grid-cols-2 gap-2">
            {REGION_OPTIONS.map((region) => (
              <OptionButton
                key={region}
                label={region}
                selected={data.accommodationRegions.includes(region)}
                onClick={() => toggleRegion(region)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
