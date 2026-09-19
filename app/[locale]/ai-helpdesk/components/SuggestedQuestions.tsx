import { HELP_DESK_COPY, SUGGESTED_QUESTIONS } from '@/constants/helpdesk';
import type { HelpDeskIntent, HelpDeskLanguage } from '../helpdesk-types';

export function SuggestedQuestions({ language, disabled, onSelect }: { language: HelpDeskLanguage; disabled: boolean; onSelect: (text: string, intent: HelpDeskIntent) => void }) {
  const copy = HELP_DESK_COPY[language];
  return <div className="mx-auto w-full max-w-2xl px-5 pt-5 sm:px-8">
    <div className="mb-5 rounded-[20px] border border-[#e5e7eb] bg-white px-5 py-5">
      <h2 className="mb-1 text-base font-bold text-slate-900">{copy.welcome}</h2>
      <p className="text-sm leading-6 text-gray-500">{copy.welcomeSub}</p>
    </div>
    <h3 className="mb-2 text-xs font-semibold text-gray-500">{copy.suggestedTitle}</h3>
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_QUESTIONS.map(question => <button key={question.id} type="button" disabled={disabled} onClick={() => onSelect(question.label[language], question.id)} className="rounded-full border border-[#b9d4de] px-3 py-2 text-left text-sm font-semibold text-[#0077a0] transition-colors hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50">{question.label[language]}</button>)}
    </div>
  </div>;
}
