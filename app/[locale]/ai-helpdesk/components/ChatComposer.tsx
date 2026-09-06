import { HELP_DESK_COPY } from '@/constants/helpdesk';
import type { HelpDeskLanguage } from '../helpdesk-types';

export function ChatComposer({ language, value, onChange, onSend, disabled }: { language: HelpDeskLanguage; value: string; onChange: (value: string) => void; onSend: () => void; disabled: boolean }) {
  const copy = HELP_DESK_COPY[language];
  return <form onSubmit={event => { event.preventDefault(); onSend(); }} className="shrink-0 border-t border-gray-200 bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
    <div className="mx-auto flex max-w-2xl items-end gap-2 px-4 pt-4">
      <textarea aria-label={copy.inputPlaceholder} placeholder={copy.inputPlaceholder} value={value} onChange={event => onChange(event.target.value)} disabled={disabled} rows={1} maxLength={2000} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); onSend(); }
      }} className="min-h-12 min-w-0 flex-1 resize-none rounded-[20px] border border-gray-200 bg-[#fafafa] px-4 py-3 text-base text-slate-900 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-60" />
      <button type="submit" disabled={disabled || !value.trim()} className="min-h-12 shrink-0 rounded-[20px] bg-[#0077b6] px-4 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">{copy.send}</button>
    </div>
  </form>;
}
