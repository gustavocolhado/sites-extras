import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      urls,
      category,
      motivation,
      name,
      email,
      address,
      phone,
      date,
      signature
    } = body

    // Validação básica
    if (!urls || !category || !motivation || !name || !email || !phone || !date || !signature) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Salvar no banco de dados
    const removalRequest = await prisma.contentRemovalRequest.create({
      data: {
        urls: urls,
        category: category,
        motivation: motivation,
        requesterName: name,
        requesterEmail: email,
        requesterAddress: address || '',
        requesterPhone: phone,
        requestDate: new Date(date),
        signature: signature,
        status: 'PENDING',
        createdAt: new Date()
      }
    })

    // Aqui você pode adicionar lógica para enviar email de confirmação
    // Por exemplo, usando um serviço como SendGrid, Resend, etc.

    return NextResponse.json({
      success: true,
      message: 'Solicitação de remoção enviada com sucesso',
      id: removalRequest.id
    })

  } catch (error) {
    console.error('Erro ao processar solicitação de remoção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}
