import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en las variables de entorno')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// IDs de los productos y precios de Stripe
// Estos se crearán en el dashboard de Stripe
export const STRIPE_PRODUCTS = {
  PRO: {
    priceId: process.env.STRIPE_PRICE_PRO || '', // Mensual $19
    name: 'Plan PRO',
    messagesLimit: 500,
  },
  PREMIUM: {
    priceId: process.env.STRIPE_PRICE_PREMIUM || '', // Mensual $49
    name: 'Plan PREMIUM',
    messagesLimit: 2000,
  },
  ENTERPRISE: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '', // Mensual $99
    name: 'Plan ENTERPRISE',
    messagesLimit: 10000,
  },
}
