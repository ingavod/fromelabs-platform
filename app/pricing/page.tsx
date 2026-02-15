'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    period: 'Gratis para siempre',
    messages: '50 mensajes/mes',
    features: [
      '✅ 50 mensajes mensuales',
      '✅ Claude Sonnet 4.5',
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
      '✅ Claude Sonnet 4.5',
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
      '✅ Claude Sonnet 4.5',
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
      '✅ Claude Sonnet 4.5',
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
]

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'FREE') {
      router.push('/register')
      return
    }

    if (planId === 'ENTERPRISE') {
      window.location.href = 'mailto:sales@fromelabs.com?subject=Enterprise Plan'
      return
    }

    if (!session) {
      router.push('/login')
      return
    }

    setLoading(planId)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear sesión de pago')
      }

      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      paddingBottom: '4rem'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem'
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

          <div className="flex gap-3">
            {!session ? (
              <>
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'rgba(0, 206, 209, 0.2)',
                    border: '1px solid rgba(0, 206, 209, 0.3)',
                    color: '#00CED1',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => router.push('/register')}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(0, 206, 209, 0.3)'
                  }}
                >
                  Comenzar gratis
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/account')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Mi cuenta
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #00CED1 0%, #00FFFF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          textShadow: '0 0 40px rgba(0, 206, 209, 0.3)'
        }}>
          Planes y Precios
        </h1>
        
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '700px',
          margin: '0 auto 1rem',
          lineHeight: '1.6'
        }}>
          Potencia tu productividad con Claude Sonnet 4.5, el modelo de IA más avanzado
        </p>

        <p style={{
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.5)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          ✨ Sin compromiso • 🔒 Cancela cuando quieras • 💳 Pago seguro con Stripe
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            color: '#ef4444',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                position: 'relative',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '2rem',
                border: `2px solid ${plan.borderColor}`,
                boxShadow: plan.popular 
                  ? '0 8px 32px rgba(0, 206, 209, 0.3)'
                  : '0 4px 16px rgba(0, 0, 0, 0.2)',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => {
                if (!plan.popular) {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 206, 209, 0.2)'
                }
              }}
              onMouseOut={(e) => {
                if (!plan.popular) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 206, 209, 0.4)'
                }}>
                  ⭐ MÁS POPULAR
                </div>
              )}

              {/* Plan Name */}
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {plan.name}
              </h3>

              {/* Messages */}
              <p style={{
                fontSize: '0.9rem',
                color: '#00CED1',
                marginBottom: '1.5rem',
                fontWeight: '500'
              }}>
                {plan.messages}
              </p>

              {/* Price */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    ${plan.price}
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul style={{ 
                marginBottom: 'auto',
                paddingBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading === plan.id}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  background: plan.popular
                    ? 'linear-gradient(135deg, #00CED1 0%, #008B8B 100%)'
                    : plan.id === 'FREE'
                      ? 'rgba(100, 116, 139, 0.3)'
                      : plan.borderColor.replace('0.5', '0.3'),
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading === plan.id ? 'not-allowed' : 'pointer',
                  opacity: loading === plan.id ? 0.7 : 1,
                  transition: 'all 0.2s',
                  boxShadow: plan.popular
                    ? '0 4px 12px rgba(0, 206, 209, 0.4)'
                    : 'none'
                }}
                onMouseOver={(e) => {
                  if (loading !== plan.id) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 206, 209, 0.4)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = plan.popular
                    ? '0 4px 12px rgba(0, 206, 209, 0.4)'
                    : 'none'
                }}
              >
                {loading === plan.id ? '⏳ Procesando...' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Preguntas Frecuentes
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <details style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <summary style={{
              color: '#00CED1',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}>
              ¿Puedo cancelar en cualquier momento?
            </summary>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem', lineHeight: '1.6' }}>
              Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de cuenta. No hay penalizaciones ni cargos ocultos.
            </p>
          </details>

          <details style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <summary style={{
              color: '#00CED1',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}>
              ¿Qué pasa si alcanzo el límite de mensajes?
            </summary>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem', lineHeight: '1.6' }}>
              Si alcanzas tu límite mensual, podrás actualizar tu plan en cualquier momento para continuar usando el servicio. Los mensajes se resetean cada mes.
            </p>
          </details>

          <details style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <summary style={{
              color: '#00CED1',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}>
              ¿Es seguro el pago?
            </summary>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1rem', lineHeight: '1.6' }}>
              Absolutamente. Usamos Stripe, la plataforma de pagos más segura del mundo. No almacenamos ningún dato de tu tarjeta en nuestros servidores.
            </p>
          </details>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/10">
        <p style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.9rem'
        }}>
          © 2026 From E Labs • Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
