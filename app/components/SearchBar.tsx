'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  theme: 'dark' | 'light'
  placeholder?: string
}

export default function SearchBar({ onSearch, theme, placeholder = 'Buscar...' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleChange = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  const bgColor = theme === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  
  const borderColor = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  
  const textColor = theme === 'dark' ? 'white' : '#1e293b'

  return (
    <div style={{
      position: 'relative',
      marginBottom: '16px'
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 40px 12px 16px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          background: bgColor,
          color: textColor,
          fontSize: '0.95rem',
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
      
      {/* Icono de búsqueda */}
      <div style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '1.2rem',
        opacity: 0.5,
        pointerEvents: query ? 'auto' : 'none',
        cursor: query ? 'pointer' : 'default'
      }}
      onClick={query ? handleClear : undefined}
      >
        {query ? '✕' : '🔍'}
      </div>
    </div>
  )
}
