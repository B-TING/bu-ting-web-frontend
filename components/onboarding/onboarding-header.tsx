'use client';

interface OnboardingHeaderProps {
  current: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function OnboardingHeader({
  current,
  total,
  onBack,
  onSkip,
  secondaryLabel,
  onSecondary,
}: OnboardingHeaderProps) {
  return (
    <header>
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className="min-w-16 text-left text-sky-700 disabled:invisible"
        >
          이전
        </button>
        <span className="text-slate-500">
          {current} / {total}
        </span>
        <button
          type="button"
          onClick={onSkip}
          disabled={!onSkip}
          className="min-w-16 rounded-lg border border-orange-300 px-3 py-2 text-orange-700 disabled:invisible"
        >
          건너뛰기
        </button>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-sky-600 transition-[width] duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>

      {secondaryLabel ? (
        <button
          type="button"
          onClick={onSecondary}
          className="mx-auto mt-4 block text-sm font-semibold text-sky-700 underline underline-offset-4"
        >
          {secondaryLabel}
        </button>
      ) : null}
    </header>
  );
}
