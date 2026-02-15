'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Usage {
  used: number
  limit: number
  plan: string
  subscriptionStatus?: string
}


const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    period: 'Gratis para siempre',
    messages: '50 mensajes/mes',
    features: [
      '✅ 50 mensajes mensuales',
      '✅ From E Labs',
      '✅ Historial de conversaciones',
      '✅ Modo oscuro/claro',
      '✅ Exportar conversaciones',
    ],
    color: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    buttonText: 'Plan Actual',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 19.99,
    period: 'por mes',
    messages: '500 mensajes/mes',
    features: [
      '✅ 500 mensajes mensuales',
      '✅ From E Labs',
      '✅ Historial ilimitado',
      '✅ Soporte prioritario',
      '✅ Adjuntar imágenes',
      '✅ Analizar documentos',
    ],
    color: 'rgba(0, 206, 209, 0.2)',
    borderColor: 'rgba(0, 206, 209, 0.5)',
    buttonText: 'Comenzar con Pro',
    popular: true,
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 49.99,
    period: 'por mes',
    messages: '2,000 mensajes/mes',
    features: [
      '✅ 2,000 mensajes mensuales',
      '✅ From E Labs',
      '✅ Todo de Pro',
      '✅ Soporte VIP',
      '✅ Acceso anticipado a funciones',
      '✅ Análisis avanzado',
    ],
    color: 'rgba(168, 85, 247, 0.2)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    buttonText: 'Comenzar con Premium',
    popular: false,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 99.99,
    period: 'por mes',
    messages: '10,000 mensajes/mes',
    features: [
      '✅ 10,000 mensajes mensuales',
      '✅ From E Labs',
      '✅ Todo de Premium',
      '✅ Soporte dedicado 24/7',
      '✅ Integraciones personalizadas',
      '✅ SLA garantizado',
    ],
    color: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.5)',
    buttonText: 'Contactar ventas',
    popular: false,
  },

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      loadUsage()
    }
  }, [status])

  useEffect(() => {
    if (searchParams.get('success')) {
      setSuccess('¡Pago exitoso! Tu plan ha sido actualizado.')
      setTimeout(() => loadUsage(), 2000)
    }
    if (searchParams.get('canceled')) {
      setError('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.')
    }
  }, [searchParams])

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

  const handleUpgrade = async (plan: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear sesión de pago')
      }

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al abrir portal')
      }

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Error al abrir el portal')
      setLoading(false)
    }
  }

  if (status === 'loading' || !usage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  const usagePercent = (usage.used / usage.limit) * 100
  const currentPlan = PLANS[usage.plan as keyof typeof PLANS]

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem'
      }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-3">
            <Image 
              src="/logo-from-e.png" 
              alt="From E Labs Logo" 
              width={40} 
              height={40}
            />
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00CED1 0%, #00FFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              From E Labs
            </span>
          </button>
          
          <h1 className="text-xl font-bold text-white">
            💎 Mi Cuenta
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Mensajes de éxito/error */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            ❌ {error}
          </div>
        )}

        {/* Plan actual */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Plan Actual: <span style={{ color: '#00CED1' }}>{usage.plan}</span>
              </h2>
              <p className="text-gray-400">
                ${currentPlan.price}/mes • {currentPlan.messages} mensajes
              </p>
            </div>

            {/* Botón gestionar suscripción */}
            {usage.plan !== 'FREE' && (
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'rgba(0, 206, 209, 0.2)',
                  border: '1px solid rgba(0, 206, 209, 0.3)',
                  color: '#00CED1',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Cargando...' : '⚙️ Gestionar suscripción'}
              </button>
            )}
          </div>

          {/* Uso de mensajes */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 font-medium">Mensajes utilizados este mes</span>
              <span className="text-white font-bold">{usage.used} / {usage.limit}</span>
            </div>
            <div style={{
              width: '100%',
              height: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(usagePercent, 100)}%`,
                height: '100%',
                background: usagePercent > 90 
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : 'linear-gradient(90deg, #00CED1, #008B8B)',
                transition: 'width 0.3s ease',
                boxShadow: usagePercent > 90 
                  ? '0 0 10px rgba(239, 68, 68, 0.5)'
                  : '0 0 10px rgba(0, 206, 209, 0.5)'
              }} />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-400">
                {usage.limit - usage.used} mensajes restantes
              </p>
              {usagePercent > 80 && (
                <p className="text-sm text-yellow-400">
                  ⚠️ {usagePercent > 90 ? 'Casi sin mensajes' : 'Quedan pocos mensajes'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Planes disponibles */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 className="text-2xl font-bold text-white mb-6">
            {usage.plan === 'FREE' ? 'Actualiza tu plan' : 'Cambiar de plan'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan PRO */}
            {usage.plan !== 'PRO' && (
              <div style={{
                background: 'rgba(0, 206, 209, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid rgba(0, 206, 209, 0.3)'
              }}>
                <h3 className="text-xl font-bold text-white mb-2">Plan PRO</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">$19</span>
                  <span className="text-gray-400">/mes</span>
                </div>
                <ul className="mb-6 space-y-2">
                  <li className="text-gray-300">✅ 500 mensajes/mes</li>
                  <li className="text-gray-300">✅ Claude Sonnet 4.5</li>
                  <li className="text-gray-300">✅ Soporte prioritario</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('PRO')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? '⏳' : 'Actualizar a PRO'}
                </button>
              </div>
            )}

            {/* Plan PREMIUM */}
            {usage.plan !== 'PREMIUM' && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid rgba(168, 85, 247, 0.3)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}>
                  ⭐ RECOMENDADO
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Plan PREMIUM</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">$49</span>
                  <span className="text-gray-400">/mes</span>
                </div>
                <ul className="mb-6 space-y-2">
                  <li className="text-gray-300">✅ 2,000 mensajes/mes</li>
                  <li className="text-gray-300">✅ Todo de PRO</li>
                  <li className="text-gray-300">✅ Soporte VIP</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('PREMIUM')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? '⏳' : 'Actualizar a PREMIUM'}
                </button>
              </div>
            )}

            {/* Plan ENTERPRISE */}
            {usage.plan !== 'ENTERPRISE' && (
              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid rgba(251, 191, 36, 0.3)'
              }}>
                <h3 className="text-xl font-bold text-white mb-2">Plan ENTERPRISE</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">$99</span>
                  <span className="text-gray-400">/mes</span>
                </div>
                <ul className="mb-6 space-y-2">
                  <li className="text-gray-300">✅ 10,000 mensajes/mes</li>
                  <li className="text-gray-300">✅ Todo de PREMIUM</li>
                  <li className="text-gray-300">✅ Soporte 24/7</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('ENTERPRISE')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? '⏳' : 'Actualizar a ENTERPRISE'}
                </button>
              </div>
            )}
          </div>

          {usage.plan === 'FREE' && (
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-400 text-sm">
                💡 <strong>Consejo:</strong> Actualiza tu plan para obtener más mensajes y acceso a funciones premium.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
