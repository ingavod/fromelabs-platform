'use client'

import { useState } from 'react'

interface EditableMessageProps {
  content: string
  onEdit: (newContent: string) => void
  onRegenerate: () => void
  theme: 'dark' | 'light'
}

export default function EditableMessage({ content, onEdit, onRegenerate, theme }: EditableMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)

  const handleSave = () => {
    if (editedContent.trim() !== content) {
      onEdit(editedContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(content)
    setIsEditing(false)
  }

  const bgColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textColor = theme === 'dark' ? 'white' : '#1e293b'
  const buttonBg = theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'

  return (
    <div style={{ position: 'relative' }}>
      {!isEditing ? (
        <>
          {/* Botones de acción */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            display: 'flex',
            gap: '6px',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: buttonBg,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#00CED1',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Editar mensaje"
            >
              ✏️ Editar
            </button>
            <button
              onClick={onRegenerate}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: buttonBg,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#00CED1',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Regenerar respuesta"
            >
              🔄 Regenerar
            </button>
          </div>
          <div style={{ paddingTop: '24px' }}>
            {content}
          </div>
        </>
      ) : (
        <>
          {/* Modo edición */}
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: bgColor,
              color: textColor,
              fontSize: '0.95rem',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit'
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
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'rgba(100, 100, 100, 0.3)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: textColor
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0, 206, 209, 0.3)'
              }}
            >
              💾 Guardar y Enviar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
