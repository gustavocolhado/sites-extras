import { prisma } from './prisma'

export type PaymentProvider = 'mercadopago' | 'pushinpay'

export interface PaymentSettings {
  activeProvider: PaymentProvider
  mercadopago: {
    enabled: boolean
    accessToken: string
    webhookUrl: string
  }
  pushinpay: {
    enabled: boolean
    accessToken: string
    webhookUrl: string
  }
}

export async function getActivePaymentProvider(): Promise<PaymentProvider> {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    const activeProvider = (settings?.activeProvider as PaymentProvider) || 'mercadopago'
    console.log('🔧 getActivePaymentProvider - Provedor ativo:', activeProvider)
    return activeProvider
  } catch (error) {
    console.error('Erro ao buscar provedor ativo:', error)
    return 'mercadopago' // Fallback para Mercado Pago
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      return {
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
      }
    }

    return {
      activeProvider: settings.activeProvider as PaymentProvider,
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
  } catch (error) {
    console.error('Erro ao buscar configurações de pagamento:', error)
    return {
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
    }
  }
}

export async function isProviderEnabled(provider: PaymentProvider): Promise<boolean> {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      return provider === 'mercadopago' // Mercado Pago como padrão
    }

    if (provider === 'mercadopago') {
      return settings.mercadopagoEnabled && !!settings.mercadopagoAccessToken
    } else if (provider === 'pushinpay') {
      return settings.pushinpayEnabled && !!settings.pushinpayAccessToken
    }

    return false
  } catch (error) {
    console.error('Erro ao verificar se provedor está habilitado:', error)
    return provider === 'mercadopago'
  }
}

export async function getProviderAccessToken(provider: PaymentProvider): Promise<string | null> {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      if (provider === 'mercadopago') {
        return process.env.MERCADO_PAGO_ACCESS_TOKEN || null
      }
      return null
    }

    if (provider === 'mercadopago') {
      return settings.mercadopagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN || null
    } else if (provider === 'pushinpay') {
      return settings.pushinpayAccessToken || process.env.PUSHIN_PAY_ACCESS_TOKEN || null
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar access token do provedor:', error)
    return null
  }
}

export async function getProviderWebhookUrl(provider: PaymentProvider): Promise<string | null> {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    
    if (!settings) {
      if (provider === 'mercadopago') {
        return process.env.MERCADO_PAGO_WEBHOOK_URL || null
      }
      return null
    }

    if (provider === 'mercadopago') {
      return settings.mercadopagoWebhookUrl || process.env.MERCADO_PAGO_WEBHOOK_URL || null
    } else if (provider === 'pushinpay') {
      return settings.pushinpayWebhookUrl || process.env.PUSHIN_PAY_WEBHOOK_URL || null
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar webhook URL do provedor:', error)
    return null
  }
}
