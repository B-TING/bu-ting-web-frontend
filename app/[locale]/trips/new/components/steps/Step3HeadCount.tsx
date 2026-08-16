'use client';

import { useTranslations } from 'next-intl';
import type { TripWizardData } from '@/types/tripWizard';

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step3HeadCount({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.step3');
  const count = data.headCount;

  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div className="text-center">
        <span className="block text-6xl font-bold tabular-nums text-gray-900">{count}</span>
        <span className="mt-2 block text-base text-gray-500">{t('unit')}</span>
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => count > 1 && onChange({ headCount: count - 1 })}
          disabled={count <= 1}
          className="flex size-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-medium text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:shadow-none"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => count < 20 && onChange({ headCount: count + 1 })}
          disabled={count >= 20}
          className="flex size-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-medium text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:shadow-none"
        >
          +
        </button>
      </div>

      {count >= 10 && <p className="text-sm text-gray-400">{t('maxWarning')}</p>}
    </div>
  );
}
