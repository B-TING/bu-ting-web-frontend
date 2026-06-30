import type { PreferenceQuestionData } from '@/app/my/preferences/types';

interface PreferenceQuestionProps {
  question: PreferenceQuestionData;
  value: string | string[] | null;
  onSelect: (value: string) => void;
}

export function PreferenceQuestion({
  question,
  value,
  onSelect,
}: PreferenceQuestionProps) {
  const selected = (option: string) =>
    Array.isArray(value) ? value.includes(option) : value === option;

  return (
    <section>
      <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {question.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
        {question.description}
      </p>
      <div className="mt-8 space-y-3">
        {question.options.map((option) => {
          const active = selected(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              className={`flex min-h-17 w-full items-center gap-4 rounded-2xl border-2 px-5 text-left text-base font-bold transition sm:min-h-18 sm:text-lg ${
                active
                  ? 'border-sky-600 bg-sky-50 text-slate-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200'
              }`}
            >
              <span
                className={`size-7 shrink-0 rounded-full border-2 ${
                  active ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white'
                }`}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
