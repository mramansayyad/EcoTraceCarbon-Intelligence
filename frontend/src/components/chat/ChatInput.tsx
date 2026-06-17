import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea heights
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2 border border-zinc-800 bg-zinc-950/60 p-2 rounded-xl backdrop-blur-md focus-within:border-emerald-800 transition-colors">
      <label htmlFor="chat-input" className="sr-only">
        Message EcoTrace AI
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask EcoAssistant anything about your carbon footprint..."
        aria-label="Message EcoTrace AI"
        disabled={disabled}
        className="flex-1 max-h-[120px] bg-transparent text-sm text-zinc-100 placeholder-zinc-500 border-0 outline-none ring-0 resize-none p-2 focus:ring-0 focus:outline-none"
        maxLength={2000}
      />
      
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-colors cursor-pointer"
        aria-label="Send message"
      >
        {disabled ? (
          <Sparkles className="h-5 w-5 animate-pulse text-zinc-600" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
};

export default ChatInput;
