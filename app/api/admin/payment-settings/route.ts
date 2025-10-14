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
        },
        efipay: {
          enabled: false,
          clientId: process.env.EFI_CLIENT_ID || '',
          clientSecret: process.env.EFI_CLIENT_SECRET || '',
          pixKey: process.env.EFI_PIX_KEY || '',
          apiUrl: process.env.EFI_API_URL || 'https://pix-h.api.efipay.com.br',
          certPassword: process.env.EFI_CERT_PASSWORD || '',
          webhookUrl: process.env.EFI_WEBHOOK_URL || ''
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
      },
      efipay: {
        enabled: settings.efipayEnabled,
        clientId: settings.efipayClientId || '',
        clientSecret: settings.efipayClientSecret || '',
        pixKey: settings.efipayPixKey || '',
        apiUrl: settings.efipayApiUrl || 'https://pix-h.api.efipay.com.br',
        certPassword: settings.efipayCertPassword || '',
        webhookUrl: settings.efipayWebhookUrl || ''
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
    const { activeProvider, mercadopago, pushinpay, efipay } = body

    // Validar dados
    if (!activeProvider || !['mercadopago', 'pushinpay', 'efipay'].includes(activeProvider)) {
      return NextResponse.json(
        { error: 'Provedor inválido' },
        { status: 400 }
      )
    }

    // Buscar configurações existentes ou criar novas
    let settings = await prisma.paymentSettings.findFirst()
    
    const data = {
      activeProvider,
      mercadopagoEnabled: activeProvider === 'mercadopago',
      mercadopagoAccessToken: mercadopago?.accessToken || '',
      mercadopagoWebhookUrl: mercadopago?.webhookUrl || '',
      pushinpayEnabled: activeProvider === 'pushinpay',
      pushinpayAccessToken: pushinpay?.accessToken || '',
      pushinpayWebhookUrl: pushinpay?.webhookUrl || '',
      efipayEnabled: activeProvider === 'efipay',
      efipayClientId: efipay?.clientId || '',
      efipayClientSecret: efipay?.clientSecret || '',
      efipayPixKey: efipay?.pixKey || '',
      efipayApiUrl: efipay?.apiUrl || 'https://pix-h.api.efipay.com.br',
      efipayCertPassword: efipay?.certPassword || '',
      efipayWebhookUrl: efipay?.webhookUrl || ''
    }

    if (!settings) {
      settings = await prisma.paymentSettings.create({ data })
    } else {
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data,
      })
    }

    console.log('✅ Configurações de pagamento atualizadas:', {
      activeProvider: settings.activeProvider,
      mercadopagoEnabled: settings.mercadopagoEnabled,
      pushinpayEnabled: settings.pushinpayEnabled,
      efipayEnabled: settings.efipayEnabled
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
        },
        efipay: {
          enabled: settings.efipayEnabled,
          clientId: settings.efipayClientId || '',
          clientSecret: settings.efipayClientSecret || '',
          pixKey: settings.efipayPixKey || '',
          apiUrl: settings.efipayApiUrl || 'https://pix-h.api.efipay.com.br',
          certPassword: settings.efipayCertPassword || '',
          webhookUrl: settings.efipayWebhookUrl || ''
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
