'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  theme: 'dark' | 'light'
}

export default function MessageBubble({ role, content, theme }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem',
      gap: '12px'
    }}>
      {!isUser && (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 206, 209, 0.3)'
        }}>
          ✨
        </div>
      )}

      <div style={{
        maxWidth: '75%',
        position: 'relative',
        borderRadius: '12px',
        padding: '12px 16px',
        background: isUser
          ? 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)'
          : theme === 'dark'
          ? 'rgba(30, 41, 59, 0.8)'
          : 'rgba(241, 245, 249, 0.9)',
        color: isUser ? 'white' : theme === 'dark' ? '#e2e8f0' : '#1e293b',
        boxShadow: isUser
          ? '0 2px 8px rgba(0, 206, 209, 0.3)'
          : theme === 'dark'
          ? '0 2px 8px rgba(0, 0, 0, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: isUser ? 'none' : theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        {/* Botón copiar */}
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: theme === 'dark' ? '#00CED1' : '#008B8B',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>

        {/* Contenido con Markdown */}
        <div style={{ paddingTop: '24px' }}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: '8px 0',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={className}
                    style={{
                      background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.9em',
                      fontFamily: 'monospace'
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
              p({ children }) {
                return <p style={{ margin: '0.5em 0', lineHeight: '1.6' }}>{children}</p>
              },
              ul({ children }) {
                return <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ul>
              },
              ol({ children }) {
                return <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ol>
              },
              li({ children }) {
                return <li style={{ margin: '0.3em 0' }}>{children}</li>
              },
              h1({ children }) {
                return <h1 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' }}>{children}</h1>
              },
              h2({ children }) {
                return <h2 style={{ fontSize: '1.3em', fontWeight: 'bold', margin: '0.5em 0' }}>{children}</h2>
              },
              h3({ children }) {
                return <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '0.5em 0' }}>{children}</h3>
              },
              blockquote({ children }) {
                return (
                  <blockquote style={{
                    borderLeft: `3px solid ${theme === 'dark' ? '#00CED1' : '#008B8B'}`,
                    paddingLeft: '1em',
                    margin: '0.5em 0',
                    fontStyle: 'italic',
                    opacity: 0.9
                  }}>
                    {children}
                  </blockquote>
                )
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: isUser ? 'white' : '#00CED1',
                      textDecoration: 'underline'
                    }}
                  >
                    {children}
                  </a>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {isUser && (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0
        }}>
          👤
        </div>
      )}
    </div>
  )
}
