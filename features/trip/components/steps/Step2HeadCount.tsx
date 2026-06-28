'use client';

import type { TripWizardData } from '@/types/tripWizard';

interface Props {
  data: TripWizardData;
  onChange: (updates: Partial<TripWizardData>) => void;
}

export default function Step2HeadCount({ data, onChange }: Props) {
  const count = data.headCount;

  const decrement = () => {
    if (count > 1) onChange({ headCount: count - 1 });
  };

  const increment = () => {
    if (count < 20) onChange({ headCount: count + 1 });
  };

  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div className="text-center">
        <span className="block text-6xl font-bold tabular-nums text-gray-900">{count}</span>
        <span className="mt-2 block text-base text-gray-500">명</span>
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={decrement}
          disabled={count <= 1}
          className="flex size-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-medium text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:shadow-none"
        >
          −
        </button>
        <button
          type="button"
          onClick={increment}
          disabled={count >= 20}
          className="flex size-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-medium text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:shadow-none"
        >
          +
        </button>
      </div>

      {count >= 10 && (
        <p className="text-sm text-gray-400">최대 20명까지 선택할 수 있어요.</p>
      )}
    </div>
  );
}
