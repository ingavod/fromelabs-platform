'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  onImageRemove: () => void
  selectedImage: { file: File; preview: string } | null
  theme: 'dark' | 'light'
}

export default function ImageUpload({ onImageSelect, onImageRemove, selectedImage, theme }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen')
      return
    }

    // Límite de 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no debe superar 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      onImageSelect(file, e.target?.result as string)
    }
    reader.readAsDataURL(file)
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

  const bgColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'
  const borderColor = isDragging 
    ? '#00CED1' 
    : theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'

  if (selectedImage) {
    return (
      <div style={{
        position: 'relative',
        padding: '12px',
        borderRadius: '12px',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        marginBottom: '12px'
      }}>
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <img 
            src={selectedImage.preview} 
            alt="Vista previa" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        <button
          onClick={onImageRemove}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.9)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          ✕ Quitar
        </button>
        <p style={{
          marginTop: '8px',
          fontSize: '0.85rem',
          color: textColor
        }}>
          📎 {selectedImage.file.name}
        </p>
      </div>
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
          🖼️
        </div>
        <p style={{
          margin: 0,
          color: textColor,
          fontSize: '0.9rem'
        }}>
          {isDragging 
            ? 'Suelta la imagen aquí' 
            : 'Click o arrastra una imagen'}
        </p>
        <p style={{
          margin: '4px 0 0 0',
          color: textColor,
          fontSize: '0.75rem',
          opacity: 0.6
        }}>
          PNG, JPG, GIF, WEBP (máx. 10MB)
        </p>
      </div>
    </>
  )
}
