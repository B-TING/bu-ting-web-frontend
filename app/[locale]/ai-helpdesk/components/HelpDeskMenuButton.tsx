'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { HELP_DESK_COPY } from '@/constants/helpdesk';

// Same alpha restriction as mobile. The page remains available for direct preview.
export function HelpDeskMenuButton() {
  const locale = useLocale();
  const language = locale === 'en' || locale === 'ja' || locale === 'zh' ? locale : 'ko';
  const [showNotice, setShowNotice] = useState(false);
  const notices = { ko: 'AI 헬프데스크는 준비 중이에요.', en: 'AI Help Desk is coming soon.', ja: 'AIヘルプデスクは準備中です。', zh: 'AI帮助台即将推出。' };
  return <>
    <button type="button" onClick={() => setShowNotice(true)} className="block w-full rounded-lg px-3 py-3 text-left font-medium text-gray-700 hover:bg-gray-100">{HELP_DESK_COPY[language].screenTitle}</button>
    {showNotice && <p role="status" className="px-3 pb-3 text-sm text-gray-500">{notices[language]}</p>}
  </>;
}
