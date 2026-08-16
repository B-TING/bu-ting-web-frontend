'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { TripWizardData } from '@/types/tripWizard';

const TITLE_MAX_LENGTH = 15;

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step1Title({ data, onChange }: Props) {
  const t = useTranslations('trip.wizard.step1');

  return (
    <div className="space-y-1.5">
      <input
        type="text"
        value={data.title}
        maxLength={TITLE_MAX_LENGTH}
        placeholder={t('placeholder')}
        onChange={(e) => onChange({ title: e.target.value })}
        className={cn(
          'w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm outline-none',
          'transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
          'bg-white placeholder:text-gray-400',
          data.title ? 'border-gray-300' : 'border-gray-200'
        )}
      />
      <p className="text-right text-xs text-gray-400">
        {data.title.length} / {TITLE_MAX_LENGTH}
      </p>
    </div>
  );
}
