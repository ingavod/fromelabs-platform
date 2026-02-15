'use client'

interface ThemeToggleProps {
  theme: 'dark' | 'light'
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'relative',
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        background: isDark 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        border: isDark 
          ? '2px solid rgba(255, 255, 255, 0.2)'
          : '2px solid rgba(251, 191, 36, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.2)'
          : '0 2px 8px rgba(251, 191, 36, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
        padding: 0,
        overflow: 'hidden'
      }}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {/* Círculo deslizante */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: isDark ? '2px' : 'calc(100% - 22px)',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: isDark
          ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
        boxShadow: isDark
          ? '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
          : '0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem'
      }}>
        {isDark ? '🌙' : '☀️'}
      </div>
      
      {/* Estrellas decorativas en modo oscuro */}
      {isDark && (
        <>
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 0 2px rgba(255, 255, 255, 0.8)'
          }} />
          <div style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 0 2px rgba(255, 255, 255, 0.6)'
          }} />
        </>
      )}
      
      {/* Rayos de sol en modo claro */}
      {!isDark && (
        <>
          <div style={{
            position: 'absolute',
            top: '11px',
            left: '8px',
            width: '8px',
            height: '2px',
            borderRadius: '1px',
            background: 'rgba(255, 255, 255, 0.7)',
            transform: 'rotate(-45deg)'
          }} />
          <div style={{
            position: 'absolute',
            top: '11px',
            left: '8px',
            width: '8px',
            height: '2px',
            borderRadius: '1px',
            background: 'rgba(255, 255, 255, 0.7)',
            transform: 'rotate(45deg)'
          }} />
        </>
      )}
    </button>
  )
}
