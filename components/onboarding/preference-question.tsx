'use client';

import { Check } from 'lucide-react';

import type { OnboardingQuestion } from '@/constants/onboarding';

interface PreferenceQuestionProps {
  question: OnboardingQuestion;
  value: string | string[] | null;
  onChange: (value: string) => void;
}

export function PreferenceQuestion({
  question,
  value,
  onChange,
}: PreferenceQuestionProps) {
  const isSelected = (option: string) =>
    Array.isArray(value) ? value.includes(option) : value === option;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {question.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
        {question.description}
      </p>

      <div className="mt-8 space-y-3">
        {question.options.map((option) => {
          const selected = isSelected(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-5 text-left text-base font-semibold transition sm:min-h-18 sm:text-lg ${
                selected
                  ? 'border-sky-600 bg-sky-50 text-sky-950 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/50'
              }`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {selected ? <Check className="size-4" aria-hidden="true" /> : null}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
