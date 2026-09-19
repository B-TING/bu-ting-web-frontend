import type { ChatMessage } from '../helpdesk-types';

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  return <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <p className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-sm bg-[#0077b6] text-white' : 'rounded-bl-sm border border-gray-200 bg-white text-slate-800'}`}>{message.text}</p>
  </div>;
}
