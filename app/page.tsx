"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Añadir mensaje del usuario
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      
      // Añadir respuesta de la IA
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Error al conectar con la IA. Intenta de nuevo." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">✨</div>
            <span className="logo-text">From E</span>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Historial</button>
            <button className="btn-primary">Cuenta</button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="chat-container">
        <div className="messages-wrapper">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h2 className="empty-title">¿En qué puedo ayudarte hoy?</h2>
              <p className="empty-subtitle">Escribe tu pregunta abajo para comenzar</p>
              
              <div className="suggestions">
                <button 
                  className="suggestion-card"
                  onClick={() => setInput("Explícame qué es machine learning")}
                >
                  <span className="suggestion-icon">🤖</span>
                  <span>Explícame machine learning</span>
                </button>
                <button 
                  className="suggestion-card"
                  onClick={() => setInput("Ayúdame a escribir un email profesional")}
                >
                  <span className="suggestion-icon">✉️</span>
                  <span>Escribe un email</span>
                </button>
                <button 
                  className="suggestion-card"
                  onClick={() => setInput("Dame ideas para mi proyecto")}
                >
                  <span className="suggestion-icon">💡</span>
                  <span>Ideas de proyecto</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === "user" ? "👤" : "✨"}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">✨</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="input-field"
              rows="1"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="input-hint">
            Presiona Enter para enviar, Shift + Enter para nueva línea
          </p>
        </div>
      </main>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-secondary, .btn-primary {
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem;
        }

        .messages-wrapper {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 2rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .empty-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .empty-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          margin-bottom: 3rem;
        }

        .suggestions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          width: 100%;
          max-width: 700px;
        }

        .suggestion-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }

        .suggestion-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(102, 126, 234, 0.5);
          transform: translateY(-2px);
        }

        .suggestion-icon {
          font-size: 1.5rem;
        }

        .messages {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .message {
          display: flex;
          gap: 1rem;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.1);
        }

        .message.assistant .message-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .message-content {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .message.assistant .message-content {
          background: rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .message-text {
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .typing-indicator {
          display: flex;
          gap: 0.4rem;
          padding: 0.5rem 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }

        .input-container {
          position: sticky;
          bottom: 0;
          background: rgba(15, 15, 30, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 0.75rem 1rem;
          transition: all 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .input-field {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          resize: none;
          outline: none;
          max-height: 200px;
          font-family: inherit;
          line-height: 1.5;
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .send-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: white;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-hint {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.5rem;
          text-align: center;
        }

        /* Scrollbar personalizado */
        .messages-wrapper::-webkit-scrollbar {
          width: 8px;
        }

        .messages-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .messages-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .messages-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

