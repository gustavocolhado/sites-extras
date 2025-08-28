import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar autenticação e permissões de admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.access !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar configurações atuais
    const settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      // Retornar configurações padrão se não existirem
      return NextResponse.json({
        activeProvider: 'mercadopago',
        mercadopago: {
          enabled: true,
          accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
          webhookUrl: process.env.MERCADO_PAGO_WEBHOOK_URL || ''
        },
        pushinpay: {
          enabled: false,
          accessToken: process.env.PUSHIN_PAY_ACCESS_TOKEN || '',
          webhookUrl: process.env.PUSHIN_PAY_WEBHOOK_URL || ''
        }
      })
    }

    return NextResponse.json({
      activeProvider: settings.activeProvider,
      mercadopago: {
        enabled: settings.mercadopagoEnabled,
        accessToken: settings.mercadopagoAccessToken || '',
        webhookUrl: settings.mercadopagoWebhookUrl || ''
      },
      pushinpay: {
        enabled: settings.pushinpayEnabled,
        accessToken: settings.pushinpayAccessToken || '',
        webhookUrl: settings.pushinpayWebhookUrl || ''
      }
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação e permissões de admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.access !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { activeProvider, mercadopago, pushinpay } = body

    // Validar dados
    if (!activeProvider || !['mercadopago', 'pushinpay'].includes(activeProvider)) {
      return NextResponse.json(
        { error: 'Provedor inválido' },
        { status: 400 }
      )
    }

    // Buscar configurações existentes ou criar novas
    let settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          activeProvider,
          mercadopagoEnabled: activeProvider === 'mercadopago',
          mercadopagoAccessToken: mercadopago.accessToken,
          mercadopagoWebhookUrl: mercadopago.webhookUrl,
          pushinpayEnabled: activeProvider === 'pushinpay',
          pushinpayAccessToken: pushinpay.accessToken,
          pushinpayWebhookUrl: pushinpay.webhookUrl,
        }
      })
    } else {
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: {
          activeProvider,
          mercadopagoEnabled: activeProvider === 'mercadopago',
          mercadopagoAccessToken: mercadopago.accessToken,
          mercadopagoWebhookUrl: mercadopago.webhookUrl,
          pushinpayEnabled: activeProvider === 'pushinpay',
          pushinpayAccessToken: pushinpay.accessToken,
          pushinpayWebhookUrl: pushinpay.webhookUrl,
        }
      })
    }

    console.log('✅ Configurações de pagamento atualizadas:', {
      activeProvider: settings.activeProvider,
      mercadopagoEnabled: settings.mercadopagoEnabled,
      pushinpayEnabled: settings.pushinpayEnabled
    })

    return NextResponse.json({
      message: 'Configurações salvas com sucesso',
      settings: {
        activeProvider: settings.activeProvider,
        mercadopago: {
          enabled: settings.mercadopagoEnabled,
          accessToken: settings.mercadopagoAccessToken || '',
          webhookUrl: settings.mercadopagoWebhookUrl || ''
        },
        pushinpay: {
          enabled: settings.pushinpayEnabled,
          accessToken: settings.pushinpayAccessToken || '',
          webhookUrl: settings.pushinpayWebhookUrl || ''
        }
      }
    })
  } catch (error) {
    console.error('Erro ao salvar configurações de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
