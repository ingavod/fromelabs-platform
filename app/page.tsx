'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MessageBubble from './components/MessageBubble'
import ThemeToggle from './components/ThemeToggle'
import SearchBar from './components/SearchBar'
import ExportMenu from './components/ExportMenu'
import ImageUpload from './components/ImageUpload'
import DocumentUpload from './components/DocumentUpload'
import { processDocument, processImage } from './utils/fileUtils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  createdAt: string
}

interface Usage {
  used: number
  limit: number
  plan: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      loadUsage()
      loadHistory()
    }
  }, [status])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadUsage = async () => {
    try {
      const res = await fetch('/api/chat?getUsage=true')
      const data = await res.json()
      if (data.usage) {
        setUsage(data.usage)
      }
    } catch (err) {
      console.error('Error al cargar uso:', err)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/chat?getHistory=true')
      const data = await res.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (err) {
      console.error('Error al cargar historial:', err)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        setCurrentConversationId(conversationId)
        setShowHistory(false)
      }
    } catch (err) {
      console.error('Error al cargar conversación:', err)
    }
  }

  const newConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    setShowHistory(false)
    setSelectedImage(null)
    setSelectedDocument(null)
    setShowAttachMenu(false)
  }

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage && !selectedDocument) || loading) return

    const userMessage: Message = { role: 'user', content: input || '(Imagen/Documento adjunto)' }
    setMessages(prev => [...prev, userMessage])
    
    const currentInput = input
    const currentImage = selectedImage
    const currentDocument = selectedDocument
    
    setInput('')
    setSelectedImage(null)
    setSelectedDocument(null)
    setShowAttachMenu(false)
    setLoading(true)

    try {
      let imageData = null
      let documentData = null

      if (currentImage) {
        imageData = await processImage(currentImage.file)
      }

      if (currentDocument) {
        documentData = await processDocument(currentDocument)
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId: currentConversationId,
          image: imageData,
          document: documentData
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          alert(`⚠️ Límite alcanzado\n\n${data.error}\n\nActualiza tu plan para continuar.`)
          router.push('/account')
        } else {
          throw new Error(data.error || 'Error al enviar mensaje')
        }
        setLoading(false)
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      }
      setMessages(prev => [...prev, assistantMessage])

      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId)
      }

      if (data.usage) {
        setUsage(data.usage)
      }

      loadHistory()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar mensaje. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ color: theme === 'dark' ? 'white' : '#1e293b' }}>
          Cargando...
        </div>
      </div>
    )
  }

  const sidebarBg = theme === 'dark'
    ? 'rgba(15, 23, 42, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'
  
  const borderColor = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'

  const textColor = theme === 'dark' ? 'white' : '#1e293b'

  return (
    <div className="flex h-screen" style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      transition: 'background 0.3s ease'
    }}>
      {/* Sidebar lateral */}
      <aside style={{
        width: sidebarOpen ? '280px' : '60px',
        background: sidebarBg,
        backdropFilter: 'blur(10px)',
        borderRight: `1px solid ${borderColor}`,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            padding: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#00CED1',
            fontSize: '1.5rem',
            textAlign: 'left',
            transition: 'all 0.2s'
          }}
          title={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {sidebarOpen && (
          <>
            {/* Botones principales */}
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Toggle tema */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>

              {/* Nueva conversación */}
              <button
                onClick={newConversation}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: theme === 'dark' ? 'rgba(0, 206, 209, 0.2)' : 'rgba(0, 206, 209, 0.3)',
                  border: '1px solid rgba(0, 206, 209, 0.3)',
                  color: '#00CED1',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme === 'dark' 
                    ? 'rgba(0, 206, 209, 0.3)'
                    : 'rgba(0, 206, 209, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = theme === 'dark'
                    ? 'rgba(0, 206, 209, 0.2)'
                    : 'rgba(0, 206, 209, 0.3)'
                }}
              >
                ➕ Nueva conversación
              </button>

              {/* Historial */}
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: theme === 'dark' ? 'rgba(0, 206, 209, 0.2)' : 'rgba(0, 206, 209, 0.3)',
                  border: '1px solid rgba(0, 206, 209, 0.3)',
                  color: '#00CED1',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                📋 Historial
              </button>

              {/* Exportar */}
              <button
                onClick={() => {
                  if (messages.length > 0) {
                    // Mostrar un menú o simplemente exportar en un formato por defecto
                    alert('Función de exportar - Por implementar menú completo')
                  }
                }}
                disabled={messages.length === 0}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: theme === 'dark' ? 'rgba(0, 206, 209, 0.2)' : 'rgba(0, 206, 209, 0.3)',
                  border: '1px solid rgba(0, 206, 209, 0.3)',
                  color: '#00CED1',
                  cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  opacity: messages.length === 0 ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (messages.length > 0) {
                    e.currentTarget.style.background = theme === 'dark' 
                      ? 'rgba(0, 206, 209, 0.3)'
                      : 'rgba(0, 206, 209, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  if (messages.length > 0) {
                    e.currentTarget.style.background = theme === 'dark'
                      ? 'rgba(0, 206, 209, 0.2)'
                      : 'rgba(0, 206, 209, 0.3)'
                  }
                }}
              >
                📥 Exportar
              </button>
            </div>

            {/* Separador */}
            <div style={{
              margin: '20px 16px',
              height: '1px',
              background: borderColor
            }} />

            {/* Info del plan */}
            {usage && (
              <div style={{ padding: '0 16px' }}>
                <button
                  onClick={() => router.push('/account')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: theme === 'dark' ? 'rgba(0, 206, 209, 0.2)' : 'rgba(0, 206, 209, 0.3)',
                    border: '1px solid rgba(0, 206, 209, 0.3)',
                    color: '#00CED1',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = theme === 'dark' 
                      ? 'rgba(0, 206, 209, 0.3)'
                      : 'rgba(0, 206, 209, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = theme === 'dark'
                      ? 'rgba(0, 206, 209, 0.2)'
                      : 'rgba(0, 206, 209, 0.3)'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💎</div>
                  <div style={{ fontWeight: '600' }}>{usage.plan}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>
                    {usage.limit - usage.used} / {usage.limit}
                  </div>
                </button>
              </div>
            )}

            {/* Botón salir */}
            <div style={{ marginTop: 'auto', padding: '16px' }}>
              <button
                onClick={() => signOut()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: theme === 'dark' ? 'rgba(0, 206, 209, 0.2)' : 'rgba(0, 206, 209, 0.3)',
                  border: '1px solid rgba(0, 206, 209, 0.3)',
                  color: '#00CED1',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme === 'dark' 
                    ? 'rgba(0, 206, 209, 0.3)'
                    : 'rgba(0, 206, 209, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = theme === 'dark'
                    ? 'rgba(0, 206, 209, 0.2)'
                    : 'rgba(0, 206, 209, 0.3)'
                }}
              >
                🚪 Salir
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Área principal */}
      <div className="flex flex-col flex-1">
        {/* Header centrado con logo */}
        <header style={{
          background: sidebarBg,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${borderColor}`,
          padding: '1.5rem 2rem',
          transition: 'all 0.3s ease'
        }}>
          <div className="flex items-center justify-center gap-3">
            <div className="logo-container" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Image 
                src="/logo-from-e.png" 
                alt="From E Labs Logo" 
                width={56} 
                height={56}
                style={{ display: 'block' }}
              />
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00CED1 0%, #00FFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(0, 206, 209, 0.5)'
            }}>
              From E Labs
            </h1>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
          {messages.length === 0 ? (
            <div className="text-center" style={{ marginTop: '20%', color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>👋 ¡Hola!</h2>
              <p>Escribe un mensaje para comenzar</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
                💡 Puedes adjuntar imágenes y documentos
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                role={msg.role}
                content={msg.content}
                theme={theme}
              />
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.9)',
                color: theme === 'dark' ? '#e2e8f0' : '#1e293b'
              }}>
                ✨ Pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          background: sidebarBg,
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${borderColor}`,
          padding: '1rem 2rem',
          transition: 'all 0.3s ease'
        }}>
          <div className="max-w-4xl mx-auto">
            {showAttachMenu && (
              <div style={{ marginBottom: '12px' }}>
                <ImageUpload
                  onImageSelect={(file, preview) => setSelectedImage({ file, preview })}
                  onImageRemove={() => setSelectedImage(null)}
                  selectedImage={selectedImage}
                  theme={theme}
                />
                
                <DocumentUpload
                  onDocumentSelect={setSelectedDocument}
                  onDocumentRemove={() => setSelectedDocument(null)}
                  selectedDocument={selectedDocument}
                  theme={theme}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  background: showAttachMenu 
                    ? 'rgba(0, 206, 209, 0.2)'
                    : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                  color: showAttachMenu ? '#00CED1' : textColor,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s'
                }}
                title="Adjuntar imagen o documento"
              >
                📎
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                rows={1}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                  color: textColor,
                  fontSize: '1rem',
                  resize: 'none',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00CED1'
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 206, 209, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = borderColor
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !selectedImage && !selectedDocument)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: (loading || (!input.trim() && !selectedImage && !selectedDocument))
                    ? 'rgba(100, 100, 100, 0.3)'
                    : 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: (loading || (!input.trim() && !selectedImage && !selectedDocument)) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: (loading || (!input.trim() && !selectedImage && !selectedDocument)) ? 'none' : '0 4px 12px rgba(0, 206, 209, 0.4)',
                  transition: 'all 0.2s',
                  opacity: (loading || (!input.trim() && !selectedImage && !selectedDocument)) ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading && (input.trim() || selectedImage || selectedDocument)) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 206, 209, 0.6)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 206, 209, 0.4)'
                }}
              >
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Historial */}
      {showHistory && (
        <div
          onClick={() => setShowHistory(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: `1px solid ${borderColor}`
            }}
          >
            <h2 style={{ color: textColor, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              📋 Historial de Conversaciones
            </h2>
            
            <SearchBar
              onSearch={setSearchQuery}
              theme={theme}
              placeholder="Buscar conversaciones..."
            />

            {filteredConversations.length === 0 ? (
              <p style={{ 
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                textAlign: 'center',
                padding: '20px'
              }}>
                {searchQuery ? `No se encontraron conversaciones con "${searchQuery}"` : 'No hay conversaciones guardadas'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.9)',
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = theme === 'dark' 
                        ? 'rgba(0, 206, 209, 0.2)'
                        : 'rgba(0, 206, 209, 0.3)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = theme === 'dark'
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(241, 245, 249, 0.9)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                      {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
