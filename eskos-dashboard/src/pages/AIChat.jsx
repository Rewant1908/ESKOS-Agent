import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';

const FABRIC_URL = import.meta.env.VITE_FABRIC_URL;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const WELCOME = {
  role: 'assistant',
  content: "👋 Hello! I'm the ESKOS AI Product Assistant, powered by Gemini and grounded in Goel Scientific's real product knowledge base.\n\nAsk me anything about laboratory glassware — condensers, beakers, flasks, filtration systems — and I'll retrieve the exact specifications from the Knowledge Fabric before answering.",
  citations: [],
};

const SYSTEM_PROMPT = `You are ESKOS AI, an expert product assistant for Goel Scientific, a leading laboratory glassware manufacturer. 

You have access to a real-time Knowledge Fabric containing product datasheets, specifications, and relationships.

IMPORTANT RULES:
- Only answer questions about laboratory equipment and scientific products
- Ground all answers in the provided knowledge context when available
- If the context is empty, answer from your general scientific knowledge but note the limitation
- Be precise about measurements, materials, and specifications
- Format answers clearly with bullet points where appropriate
- Keep answers concise but comprehensive`;

function ChatContent() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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

    let ragContext = '';
    let citations = [];

    // 1. Retrieve context & citations from Knowledge Fabric
    try {
      const contextRes = await fetch(`${FABRIC_URL}/api/v1/knowledge/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ query: currentQuery, org_id: 'goel-scientific', rag_type: 'product', limit: 5 }),
      });
      if (contextRes.ok) {
        const contextData = await contextRes.json();
        ragContext = contextData.formatted_context || '';
      }

      const queryRes = await fetch(`${FABRIC_URL}/api/v1/knowledge/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ query: currentQuery, org_id: 'goel-scientific', rag_type: 'product', limit: 5 }),
      });
      if (queryRes.ok) {
        const queryData = await queryRes.json();
        citations = [...new Set((queryData.vector_hits || []).map(h => h.parent_doc_id))];
      }
    } catch (e) {
      console.error("RAG retrieval error", e);
    }

    // 2. Build conversation history for Gemini
    const contents = [];
    const chatHistory = messages.filter(m => !m.loading).slice(-6);
    for (const msg of chatHistory) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] });
      }
      if (msg.role === 'assistant' && !msg.loading) {
        contents.push({ role: 'model', parts: [{ text: msg.content }] });
      }
    }

    // Add current user turn with RAG context
    const userText = ragContext
      ? `Context from ESKOS Knowledge Fabric:\n${ragContext}\n\n---\nUser Question: ${currentQuery}`
      : `User Question: ${currentQuery}\n\n(Note: No specific product data was retrieved from the Knowledge Fabric for this query.)`;

    contents.push({ role: 'user', parts: [{ text: userText }] });

    // 3. Request completion from Gemini API
    try {
      const geminiRes = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          }
        }),
      });

      const geminiData = await geminiRes.json();
      const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I was unable to generate a response. Please try again.';

      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: answer, citations },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: '❌ Sorry, I encountered an error connecting to Gemini. Please verify your VITE_GEMINI_API_KEY in .env.local.', citations: [] },
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
