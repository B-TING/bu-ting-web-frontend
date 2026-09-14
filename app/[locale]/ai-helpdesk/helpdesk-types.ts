export type HelpDeskLanguage = 'ko' | 'en' | 'ja' | 'zh';
export type HelpDeskIntent = 'nearby' | 'emergency' | 'festivals' | 'lockers' | 'schedule' | 'guide' | 'unknown';
export interface SuggestedQuestion {
  id: HelpDeskIntent;
  label: Record<HelpDeskLanguage, string>;
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}
