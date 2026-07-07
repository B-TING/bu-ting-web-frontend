'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { TripWizardData } from '@/types/tripWizard';

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step1DateRange({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.step1');

  const isEndBeforeStart =
    data.startDate && data.endDate && data.endDate < data.startDate;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{t('startDate')}</label>
        <input
          type="date"
          value={data.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm outline-none',
            'transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            'bg-white placeholder:text-gray-400',
            data.startDate ? 'border-gray-300' : 'border-gray-200'
          )}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{t('endDate')}</label>
        <input
          type="date"
          value={data.endDate}
          min={data.startDate || undefined}
          onChange={(e) => onChange({ endDate: e.target.value })}
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm outline-none',
            'transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            'bg-white placeholder:text-gray-400',
            isEndBeforeStart ? 'border-red-400' : data.endDate ? 'border-gray-300' : 'border-gray-200'
          )}
        />
        {isEndBeforeStart && (
          <p className="text-xs text-red-500">{t('endBeforeStart')}</p>
        )}
      </div>

      {data.startDate && data.endDate && !isEndBeforeStart && (
        <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
          <p className="text-sm text-blue-700">
            {(() => {
              const start = new Date(data.startDate);
              const end = new Date(data.endDate);
              const days =
                Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return t('duration', { days });
            })()}
          </p>
        </div>
      )}
    </div>
  );
}
