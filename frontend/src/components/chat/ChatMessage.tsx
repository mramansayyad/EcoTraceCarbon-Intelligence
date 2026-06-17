import React from 'react';
import { Message } from '../../hooks/useChat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const text = message.parts[0]?.text || '';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md border ${
          isUser
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-100 rounded-tr-none'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-100 rounded-tl-none'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
            {isUser ? 'You' : 'EcoAssistant'}
          </span>
        </div>
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
