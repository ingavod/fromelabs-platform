'use client'

import { useState, useRef } from 'react'

interface DocumentUploadProps {
  onDocumentSelect: (file: File) => void
  onDocumentRemove: () => void
  selectedDocument: File | null
  theme: 'dark' | 'light'
}

const ACCEPTED_TYPES = {
  'application/pdf': { ext: 'PDF', icon: '📄', color: '#ef4444' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'DOCX', icon: '📘', color: '#2563eb' },
  'application/msword': { ext: 'DOC', icon: '📘', color: '#2563eb' },
  'text/plain': { ext: 'TXT', icon: '📝', color: '#64748b' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'XLSX', icon: '📊', color: '#16a34a' },
  'application/vnd.ms-excel': { ext: 'XLS', icon: '📊', color: '#16a34a' },
  'text/csv': { ext: 'CSV', icon: '📋', color: '#8b5cf6' },
}

export default function DocumentUpload({ onDocumentSelect, onDocumentRemove, selectedDocument, theme }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      alert('Tipo de archivo no soportado. Por favor sube PDF, Word, Excel, CSV o TXT.')
      return
    }

    // Límite de 25MB
    if (file.size > 25 * 1024 * 1024) {
      alert('El archivo no debe superar 25MB')
      return
    }

    onDocumentSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const getFileInfo = (file: File) => {
    const info = ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES] || { ext: 'FILE', icon: '📎', color: '#64748b' }
    return info
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const bgColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'
  const borderColor = isDragging 
    ? '#00CED1' 
    : theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'

  if (selectedDocument) {
    const fileInfo = getFileInfo(selectedDocument)
    
    return (
      <div style={{
        position: 'relative',
        padding: '16px',
        borderRadius: '12px',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          background: fileInfo.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          flexShrink: 0
        }}>
          {fileInfo.icon}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontWeight: '600',
            color: theme === 'dark' ? 'white' : '#1e293b',
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {selectedDocument.name}
          </p>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.75rem',
            color: textColor
          }}>
            {fileInfo.ext} • {formatFileSize(selectedDocument.size)}
          </p>
        </div>

        <button
          onClick={onDocumentRemove}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.9)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            flexShrink: 0
          }}
        >
          ✕ Quitar
        </button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        style={{ display: 'none' }}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          padding: '20px',
          borderRadius: '12px',
          border: `2px dashed ${borderColor}`,
          background: isDragging 
            ? 'rgba(0, 206, 209, 0.1)' 
            : bgColor,
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s',
          marginBottom: '12px'
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
          📎
        </div>
        <p style={{
          margin: 0,
          color: textColor,
          fontSize: '0.9rem'
        }}>
          {isDragging 
            ? 'Suelta el documento aquí' 
            : 'Click o arrastra un documento'}
        </p>
        <p style={{
          margin: '4px 0 0 0',
          color: textColor,
          fontSize: '0.75rem',
          opacity: 0.6
        }}>
          PDF, Word, Excel, CSV, TXT (máx. 25MB)
        </p>
      </div>
    </>
  )
}
