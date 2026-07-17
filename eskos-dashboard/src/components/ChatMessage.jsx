export default function ChatMessage({ message }) {
  const { role, content, citations = [], loading } = message;
  const isUser = role === 'user';

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="msg-avatar">{isUser ? '👤' : '🤖'}</div>
      <div>
        <div className="msg-bubble">
          {loading ? (
            <div className="typing">
              <span /><span /><span />
            </div>
          ) : (
            <>
              <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
              {citations.length > 0 && (
                <div className="msg-citations">
                  <span style={{ marginRight: '.5rem' }}>Sources:</span>
                  {citations.map((c, i) => (
                    <span key={i} className="citation-tag">📄 {c}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
