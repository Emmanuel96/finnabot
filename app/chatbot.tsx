'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  ts: number;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      ts: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // Placeholder bot response (replace with real API call)
    try {
      const fakeResponse = await mockBotCall(trimmed);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: fakeResponse,
        ts: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as any);
    }
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>Chatbot</h1>
      <div ref={listRef} style={styles.messages} aria-label="Chat history">
        {messages.length === 0 && (
          <div style={styles.placeholder}>Start the conversation below.</div>
        )}
        {messages.map(m => (
          <div
            key={m.id}
            style={{
              ...styles.message,
              ...(m.role === 'user' ? styles.userMessage : styles.botMessage)
            }}
          >
            <strong style={styles.role}>{m.role === 'user' ? 'You' : 'Bot'}: </strong>
            <span>{m.content}</span>
          </div>
        ))}
        {sending && (
          <div style={{ ...styles.message, ...styles.botMessage }}>
            <strong style={styles.role}>Bot: </strong>
            <span>Thinking...</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={styles.form} aria-label="Chat input form">
        <textarea
            style={styles.textarea}
            value={input}
            placeholder="Type your message..."
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            disabled={sending}
            aria-label="Message input"
        />
        <div style={styles.actions}>
          <button
            type="submit"
            style={styles.button}
            disabled={!input.trim() || sending}
            aria-label="Send message"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </main>
  );
}

// Fake bot function (replace with real fetch to /api/chat)
async function mockBotCall(userInput: string): Promise<string> {
  await new Promise(r => setTimeout(r, 700));
  return `Echo: ${userInput}`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, sans-serif'
  },
  heading: {
    margin: '0 0 0.75rem',
    fontSize: '1.75rem'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '0.75rem',
    background: '#fafafa'
  },
  placeholder: {
    opacity: 0.6,
    fontSize: '0.95rem'
  },
  message: {
    padding: '0.5rem 0.6rem',
    marginBottom: '0.5rem',
    borderRadius: 6,
    lineHeight: 1.4,
    fontSize: '0.95rem',
    whiteSpace: 'pre-wrap'
  },
  userMessage: {
    background: '#2563eb',
    color: '#fff',
    alignSelf: 'flex-end'
  },
  botMessage: {
    background: '#e5e7eb',
    color: '#111',
    alignSelf: 'flex-start'
  },
  role: {
    fontWeight: 600
  },
  form: {
    marginTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  textarea: {
    width: '100%',
    font: 'inherit',
    padding: '0.6rem 0.7rem',
    borderRadius: 8,
    border: '1px solid #ccc',
    resize: 'none',
    outline: 'none'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  button: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1.1rem',
    font: 'inherit',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    letterSpacing: 0.3
  }
};