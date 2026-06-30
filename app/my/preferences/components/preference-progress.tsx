interface PreferenceProgressProps {
  current: number;
  total: number;
  onBack?: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function PreferenceProgress({
  current,
  total,
  onBack,
  onSkip,
  onCancel,
}: PreferenceProgressProps) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className="min-w-16 text-left text-sm font-semibold text-sky-700 disabled:invisible"
        >
          이전
        </button>
        <span className="text-sm font-semibold text-slate-600">{current} / {total}</span>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border-2 border-orange-300 px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-50"
        >
          건너뛰기
        </button>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-sky-600 transition-[width]"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mx-auto mt-4 block text-sm font-semibold text-sky-700"
      >
        취소
      </button>
    </header>
  );
}
