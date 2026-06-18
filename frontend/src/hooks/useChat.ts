import { useState } from 'react';
import { auth } from '../lib/firebase';

export interface Message {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      role: 'user',
      parts: [{ text }]
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsStreaming(true);

    try {
      const currentUser = auth.currentUser;
      const idToken = currentUser ? await currentUser.getIdToken() : '';
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('mock_token') : '';
      const token = idToken || localToken || '';

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ history: newHistory })
      });

      if (!response.ok) {
        throw new Error(`Chat API error status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Readable stream not supported on response body');
      }

      const decoder = new TextDecoder('utf-8');
      let assistantText = '';

      // Append temporary empty assistant reply
      const assistantPlaceholder: Message = {
        role: 'model',
        parts: [{ text: '' }]
      };
      setMessages([...newHistory, assistantPlaceholder]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Save the last incomplete line back to buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith('data: ')) {
            const dataStr = cleanLine.substring(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                assistantText += parsed.text;
                
                // Update assistant message in-place
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: assistantText }];
                  }
                  return updated;
                });
              }
            } catch {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming chat failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: 'Assistant is temporarily unavailable. Please verify network connection and try again.' }]
        }
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    messages,
    sendMessage,
    isStreaming,
    clearChat: () => setMessages([])
  };
}
