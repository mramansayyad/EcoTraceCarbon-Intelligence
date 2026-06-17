import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Trash2, MessageSquare, Sparkles } from 'lucide-react';

export const AIChatPanel: React.FC = () => {
  const { messages, sendMessage, isStreaming, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] border border-zinc-800 bg-zinc-900/40 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">EcoTrace Assistant</h3>
            <p className="text-[10px] text-zinc-500 font-medium">AI Insights powered by Gemini</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-850 hover:bg-zinc-800/60 text-xs text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        role="log"
        aria-label="EcoTrace AI conversation"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto p-6 space-y-4"
        id="chat-messages"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/40 border border-zinc-700/60 mb-4 text-zinc-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-200 mb-1">Your Carbon Intelligence Companion</h4>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Ask about energy-saving tips, suggest transport alternatives, or inquire about the carbon cost of your daily meals.
            </p>
            
            {/* Suggestion tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
              {[
                'How can I lower my electricity footprint?',
                'Compare electric scooters vs metro rides',
                'What is the footprint of a vegetarian meal?',
                'Give me tips on sustainable shopping'
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => sendMessage(query)}
                  className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 hover:border-emerald-800 hover:bg-emerald-950/20 text-xs text-zinc-400 hover:text-emerald-300 transition-all cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {isStreaming && (
              <div aria-label="EcoTrace AI is typing" role="status">
                <span className="sr-only">AI is generating response...</span>
                <span className="inline-flex gap-1 items-center px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded-lg">
                  <span className="animate-pulse">Thinking...</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
};

export default AIChatPanel;
