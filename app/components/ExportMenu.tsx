'use client'

import { useState } from 'react'
import { exportToTXT, exportToMarkdown, exportToHTML, exportToJSON } from '../utils/exportUtils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ExportMenuProps {
  messages: Message[]
  conversationTitle: string
  theme: 'dark' | 'light'
}

export default function ExportMenu({ messages, conversationTitle, theme }: ExportMenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = (format: 'txt' | 'md' | 'html' | 'json') => {
    switch (format) {
      case 'txt':
        exportToTXT(messages, conversationTitle)
        break
      case 'md':
        exportToMarkdown(messages, conversationTitle)
        break
      case 'html':
        exportToHTML(messages, conversationTitle)
        break
      case 'json':
        exportToJSON(messages, conversationTitle)
        break
    }
    setShowMenu(false)
  }

  const bgColor = theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textColor = theme === 'dark' ? 'white' : '#1e293b'
  const hoverBg = theme === 'dark' ? 'rgba(0, 206, 209, 0.2)' : 'rgba(0, 206, 209, 0.3)'

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={messages.length === 0}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          background: theme === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)',
          border: `1px solid ${borderColor}`,
          color: textColor,
          cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: messages.length === 0 ? 0.5 : 1,
          transition: 'all 0.2s'
        }}
      >
        📥 Exportar
      </button>

      {showMenu && messages.length > 0 && (
        <>
          {/* Overlay para cerrar el menú */}
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
          />

          {/* Menú de opciones */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            minWidth: '200px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={() => handleExport('txt')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: textColor,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = hoverBg}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                📄 Exportar como TXT
              </button>

              <button
                onClick={() => handleExport('md')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: textColor,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = hoverBg}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                📝 Exportar como Markdown
              </button>

              <button
                onClick={() => handleExport('html')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: textColor,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = hoverBg}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                🌐 Exportar como HTML
              </button>

              <button
                onClick={() => handleExport('json')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: textColor,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = hoverBg}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                🔧 Exportar como JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
