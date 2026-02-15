'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'

interface Usage {
  used: number
  limit: number
  plan: string
  subscriptionStatus?: string
}

const PLANS = {
  FREE: {
    name: 'FREE',
    price: 0,
    messages: 50,
    features: ['50 mensajes/mes', 'From E Platform', 'Historial de conversaciones'],
  },
  PRO: {
    name: 'PRO',
    price: 19.99,
    messages: 500,
    features: ['500 mensajes/mes', 'From E Platform', 'Historial ilimitado', 'Soporte prioritario'],
  },
  PREMIUM: {
    name: 'PREMIUM',
    price: 49.99,
    messages: 2000,
    features: ['2000 mensajes/mes', 'From E Platform', 'Historial ilimitado', 'Soporte VIP', 'Acceso anticipado a nuevas funciones'],
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    price: 99.99,
    messages: 10000,
    features: ['10000 mensajes/mes', 'From E Platform', 'Historial ilimitado', 'Soporte VIP', 'Acceso anticipado', 'API dedicada'],
  },
}

function AccountContent() {
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
  const availablePlans = Object.entries(PLANS).filter(([key]) => {
    const planOrder = ['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE']
    return planOrder.indexOf(key) > planOrder.indexOf(usage.plan)
  })

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
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

      <div className="max-w-6xl mx-auto p-6">
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

        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 className="text-2xl font-bold text-white mb-6">
            Tu Plan Actual: <span style={{ color: '#00CED1' }}>{usage.plan}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Mensajes utilizados</span>
                <span className="text-white font-bold">{usage.used} / {usage.limit}</span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(usagePercent, 100)}%`,
                  height: '100%',
                  background: usagePercent > 90 
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : 'linear-gradient(90deg, #00CED1, #008B8B)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {usage.limit - usage.used} mensajes restantes este mes
              </p>
            </div>

            {usage.subscriptionStatus && usage.subscriptionStatus !== 'INACTIVE' && (
              <div className="flex items-center justify-end">
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(100, 116, 139, 0.3)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Cargando...' : '⚙️ Gestionar Suscripción'}
                </button>
              </div>
            )}
          </div>
        </div>

        {availablePlans.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Actualizar Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map(([key, plan]) => (
                <div
                  key={key}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: key === 'PREMIUM' 
                      ? '2px solid rgba(168, 85, 247, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  {key === 'PREMIUM' && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      RECOMENDADO
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/mes</span>
                  </div>

                  <ul className="space-y-2 mb-6" style={{ flexGrow: 1, marginBottom: 'auto' }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-2">
                        <span style={{ color: '#00CED1' }}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: key === 'PREMIUM'
                        ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                        : 'linear-gradient(135deg, #00CED1, #008B8B)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    {loading ? 'Procesando...' : `Actualizar a ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}
