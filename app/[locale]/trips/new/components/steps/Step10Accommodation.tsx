'use client';

import { useTranslations } from 'next-intl';
import OptionButton from '../OptionButton';
import type { AccommodationRegion, AccommodationStatus, TripWizardData } from '@/types/tripWizard';

const STATUS_OPTIONS: AccommodationStatus[] = ['booked', 'candidate'];
const REGION_OPTIONS: AccommodationRegion[] = [
  'haeundae_marine',
  'seomyeon_bujeon',
  'nampo_junggu',
  'gwangalli',
  'yeongdo',
];

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step10Accommodation({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.accommodation');

  const toggleRegion = (region: AccommodationRegion) => {
    const current = data.accommodationRegions;
    const next = current.includes(region)
      ? current.filter((v) => v !== region)
      : [...current, region];
    onChange({ accommodationRegions: next });
  };

  const selectStatus = (status: AccommodationStatus) => {
    onChange({ accommodationStatus: status });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {STATUS_OPTIONS.map((status) => (
          <OptionButton
            key={status}
            label={t(`${status}_label`)}
            description={t(`${status}_desc`)}
            selected={data.accommodationStatus === status}
            onClick={() => selectStatus(status)}
          />
        ))}
      </div>

      {data.accommodationStatus !== null && (
        <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-gray-500">{t('regionHint')}</p>
          <div className="grid grid-cols-2 gap-2">
            {REGION_OPTIONS.map((region) => (
              <OptionButton
                key={region}
                label={t(region)}
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
