import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

console.log('USANDO SONNET 4.5')

const PLAN_LIMITS = {
  FREE: 50,
  PRO: 500,
  PREMIUM: 2000,
  ENTERPRISE: 10000,
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// GET - Obtener historial o uso
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const getHistory = searchParams.get('getHistory')
    const getUsage = searchParams.get('getUsage')
    const conversationId = searchParams.get('conversationId')

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener uso de mensajes
    if (getUsage === 'true') {
      return NextResponse.json({
        usage: {
          used: user.messagesUsed,
          limit: user.messagesLimit,
          plan: user.plan
        }
      })
    }

    // Obtener historial de conversaciones
    if (getHistory === 'true') {
      const conversations = await prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        take: 50
      })

      return NextResponse.json({ conversations })
    }

    // Obtener mensajes de una conversación específica
    if (conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        select: {
          role: true,
          content: true,
        }
      })

      return NextResponse.json({ messages })
    }

    return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 })
  } catch (error) {
    console.error('ERROR:', error.message)
    console.error('STATUS:', error.status)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

// POST - Enviar mensaje
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, conversationId } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Mensajes inválidos' }, { status: 400 })
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar límite de mensajes
    const limit = PLAN_LIMITS[user.plan] || PLAN_LIMITS.FREE
    if (user.messagesUsed >= limit) {
      return NextResponse.json(
        { 
          error: `Has alcanzado tu límite de ${limit} mensajes del plan ${user.plan}.\n\nActualiza tu plan para continuar usando el servicio.`,
          messagesUsed: user.messagesUsed,
          messagesLimit: limit
        },
        { status: 429 }
      )
    }

    // Llamar a la API de Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: messages,
    })

    const assistantMessage = response.content[0].text

    // Obtener o crear conversación
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    }

    if (!conversation) {
      // Crear nueva conversación con título basado en el primer mensaje
      const firstUserMessage = messages.find(m => m.role === 'user')
      const title = firstUserMessage?.content.substring(0, 50) || 'Nueva conversación'

      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: title
        }
      })
    }

    // Guardar mensaje del usuario
    const lastUserMessage = messages[messages.length - 1]
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: lastUserMessage.content,
        tokensUsed: response.usage.input_tokens
      }
    })

    // Guardar respuesta del asistente
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantMessage,
        tokensUsed: response.usage.output_tokens
      }
    })

    // Actualizar contador de mensajes y tokens del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        messagesUsed: user.messagesUsed + 1,
        tokensUsed: user.tokensUsed + response.usage.input_tokens + response.usage.output_tokens
      }
    })

    return NextResponse.json({
      response: assistantMessage,
      conversationId: conversation.id,
      usage: {
        used: user.messagesUsed + 1,
        limit: limit,
        plan: user.plan
      }
    })
  } catch (error) {
    console.error('ERROR:', error.message)
    console.error('STATUS:', error.status)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el mensaje' },
      { status: error.status || 500 }
    )
  }
}
