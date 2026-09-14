'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { HELP_DESK_COPY } from '@/constants/helpdesk';
import { matchHelpDeskIntent, requestHelpDeskReply } from '@/lib/helpdesk';
import { useAuthStore } from '@/stores/auth-store';
import type { ChatMessage, HelpDeskIntent, HelpDeskLanguage } from '../helpdesk-types';
import { SuggestedQuestions } from './SuggestedQuestions';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatComposer } from './ChatComposer';

export function HelpDeskChat() {
  const locale = useLocale();
  const language: HelpDeskLanguage = locale === 'en' || locale === 'ja' || locale === 'zh' ? locale : 'ko';
  const copy = HELP_DESK_COPY[language];
  const token = useAuthStore(state => state.accessToken);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const busy = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const reply = useMutation({
    mutationFn: ({ text, intent }: { text: string; intent: HelpDeskIntent }) => requestHelpDeskReply(text, intent, language, Boolean(token)),
    onSuccess: text => setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'assistant', text }]),
    onSettled: () => { busy.current = false; },
  });
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [messages, reply.isPending, reply.isError]);
  function send(text: string, intent = matchHelpDeskIntent(text)) {
    if (!text.trim() || busy.current) return;
    busy.current = true;
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', text: text.trim() }]);
    setInput('');
    reply.mutate({ text: text.trim(), intent });
  }
  const errors = { ko: '답변을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', en: 'Unable to load a reply. Please try again.', ja: '回答を取得できませんでした。もう一度お試しください。', zh: '无法获取回复，请重试。' };
  const retry = { ko: '다시 시도', en: 'Retry', ja: '再試行', zh: '重试' };
  const back = { ko: '홈으로 돌아가기', en: 'Back to home', ja: 'ホームへ', zh: '返回首页' };
  return <main className="flex h-dvh min-h-0 flex-col bg-[#fafafa] text-slate-900">
    <header className="shrink-0 border-b border-gray-200 bg-white pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-5">
        <Link href={language === 'ko' ? '/' : `/${language}`} aria-label={back[language]} className="rounded-md p-1 text-[#0077a0] focus-visible:outline-2"><ArrowLeft size={24} /></Link>
        <h1 className="text-lg font-bold">{copy.screenTitle}</h1>
      </div>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {messages.length === 0 && <SuggestedQuestions language={language} disabled={reply.isPending} onSelect={send} />}
      <div role="log" aria-label={copy.screenTitle} aria-live="polite" aria-relevant="additions" className="mx-auto max-w-2xl space-y-3 px-5 py-4">
        {messages.map(message => <ChatMessageBubble key={message.id} message={message} />)}
        {reply.isPending && <div role="status" className="flex items-center gap-2 text-sm text-gray-500"><LoaderCircle className="h-4 w-4 animate-spin" />{copy.typing}</div>}
        {reply.isError && <div role="alert" className="rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700"><p>{errors[language]}</p><button type="button" className="mt-2 underline" onClick={() => { if (busy.current || !reply.variables) return; busy.current = true; reply.mutate(reply.variables); }}>{retry[language]}</button></div>}
        <div ref={end} />
      </div>
    </div>
    <ChatComposer language={language} value={input} onChange={setInput} onSend={() => send(input)} disabled={reply.isPending} />
  </main>;
}
