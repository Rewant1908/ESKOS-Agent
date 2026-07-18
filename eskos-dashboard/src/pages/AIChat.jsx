import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';

const KONG_URL = import.meta.env.VITE_KONG_URL || 'http://localhost:8000';

const WELCOME = {
  role: 'assistant',
  content: "👋 Hello! I'm the ESKOS AI Product Assistant, powered by Gemini and grounded in Goel Scientific's real product knowledge base.\n\nAsk me anything about laboratory glassware — condensers, beakers, flasks, filtration systems — and I'll retrieve the exact specifications from the Knowledge Fabric before answering.",
  citations: [],
};

function ChatContent() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(undefined);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setInput(q); }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const currentQuery = input;
    const userMsg = { role: 'user', content: currentQuery };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Add typing indicator
    setMessages(prev => [...prev, { role: 'assistant', content: '', loading: true }]);

    try {
      const res = await fetch(`${KONG_URL}/api/v1/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-eskos-org-id': 'goel-scientific',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          message: currentQuery,
          session_id: sessionId
        }),
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      const answer = data.reply || 'I was unable to generate a response. Please try again.';
      const citations = data.tool_calls ? data.tool_calls.map(t => t.name || t) : [];

      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: answer, citations },
      ]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: '❌ Sorry, I encountered an error connecting to the agent. Please verify your VITE_KONG_URL.', citations: [] },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickQuestions = [
    'What condensers does Goel Scientific make?',
    'What is the thermal shock limit of the Allihn Condenser?',
    'Compare the Allihn and Liebig condensers',
    'What applications are desiccators used for?',
  ];

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>🤖 AI Product Assistant</h2>
        <p>Powered by Gemini + ESKOS Knowledge Fabric · Answers grounded in real product data</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Quick question chips */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', paddingBottom: '1rem' }}>
          {quickQuestions.map(q => (
            <button key={q} className="btn btn-ghost" style={{ fontSize: '.8rem', borderRadius: '999px' }}
              onClick={() => setInput(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            id="chat-input"
            className="chat-textarea"
            placeholder="Ask about any Goel Scientific product..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button id="chat-send" className="chat-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIChat() {
  return (
    <Suspense fallback={<div className="loading-dots" style={{paddingTop:'6rem'}}><span/><span/><span/></div>}>
      <ChatContent />
    </Suspense>
  );
}
