import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { getActivePaymentProvider, getProviderAccessToken, getProviderWebhookUrl } from '@/lib/payment-provider'

interface CreatePixRequest {
  preferenceId: string
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body: CreatePixRequest = await request.json()
    const { preferenceId } = body

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'ID da preferência não fornecido' },
        { status: 400 }
      )
    }

    // Obter provedor ativo primeiro
    const activeProvider = await getActivePaymentProvider()
    console.log('🔧 Provedor ativo:', activeProvider)

    if (activeProvider === 'mercadopago') {
      // Configurar Mercado Pago
      const accessToken = await getProviderAccessToken('mercadopago')
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Token de acesso do Mercado Pago não configurado' },
          { status: 500 }
        )
      }

      const mercadopago = new MercadoPagoConfig({ accessToken })

      // Buscar dados da preferência para obter valor e email
      const preferenceClient = new Preference(mercadopago)
      const preference = await preferenceClient.get({ preferenceId })

      if (!preference.items || preference.items.length === 0) {
        return NextResponse.json(
          { error: 'Preferência inválida' },
          { status: 400 }
        )
      }

      const item = preference.items[0]
      const userEmail = preference.payer?.email || 'user@example.com'

      // Buscar PaymentSession baseada no external_reference ou preferenceId
      let paymentSession = null
      
      // Tentar buscar por external_reference primeiro
      if (preference.external_reference) {
        console.log('🔍 Tentando buscar PaymentSession por external_reference:', preference.external_reference);
        
        // O external_reference tem o formato: userId_plan_paymentSessionId
        const parts = preference.external_reference.split('_');
        if (parts.length >= 3) {
          const paymentSessionId = parts[parts.length - 1];
          console.log('🔍 Tentando buscar PaymentSession por ID do external_reference:', paymentSessionId);
          paymentSession = await prisma.paymentSession.findUnique({
            where: { id: paymentSessionId }
          });
          
          if (paymentSession) {
            console.log('✅ PaymentSession encontrada por ID do external_reference:', paymentSession.id);
          }
        }
      }

      // Se não encontrou por external_reference, tentar por preferenceId
      if (!paymentSession) {
        console.log('🔍 Tentando buscar PaymentSession por preferenceId:', preferenceId);
        paymentSession = await prisma.paymentSession.findFirst({
          where: {
            OR: [
              { preferenceId: preferenceId },
              { preferenceId: { contains: preferenceId } }
            ]
          },
        });
        
        if (paymentSession) {
          console.log('✅ PaymentSession encontrada por preferenceId:', paymentSession.id);
        }
      }

      if (!paymentSession) {
        console.warn('⚠️ PaymentSession não encontrada para preferenceId:', preferenceId);
      }

      // Configurar webhook URL apenas para produção
      let webhookUrl: string | undefined = undefined
      
      if (process.env.NODE_ENV === 'production') {
        const baseUrl = process.env.HOST_URL || 'https://cornosbrasil.com'
        webhookUrl = `${baseUrl}/api/mercado-pago/webhook`
        console.log('🔗 Webhook configurado para PIX Premium (produção):', webhookUrl)
      } else {
        console.log('ℹ️ Webhook não configurado para desenvolvimento local')
      }

      // Criar pagamento PIX
      const payment: any = {
        transaction_amount: item.unit_price,
        description: item.title,
        payment_method_id: 'pix',
        payer: {
          email: userEmail,
        },
        external_reference: preferenceId,
      }

      // Adicionar webhook apenas se estiver em produção
      if (webhookUrl) {
        payment.notification_url = webhookUrl
      }

      const paymentClient = new Payment(mercadopago)
      const response = await paymentClient.create({ body: payment })

      if (!response.point_of_interaction?.transaction_data?.qr_code) {
        throw new Error('QR Code PIX não gerado')
      }

      const paymentId = response.id;
      console.log('✅ PIX Mercado Pago criado com paymentId:', paymentId);

      // Atualizar PaymentSession com o paymentId se encontrada
      if (paymentSession) {
        console.log('🔍 Atualizando PaymentSession com paymentId:', paymentId);
        
        const updatedPaymentSession = await prisma.paymentSession.update({
          where: { id: paymentSession.id },
          data: {
            paymentId: paymentId,
            status: 'pending', // Status temporário até o webhook confirmar
          },
        });

        console.log('✅ PaymentSession atualizada com paymentId:', {
          id: updatedPaymentSession.id,
          paymentId: updatedPaymentSession.paymentId,
          status: updatedPaymentSession.status
        });
      } else {
        console.warn('⚠️ PaymentSession não encontrada para atualizar com paymentId:', paymentId);
      }

      const pixData = {
        qr_code: response.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        payment_id: paymentId,
        provider: 'mercadopago' // Identificar o provedor para o frontend
      }

      return NextResponse.json(pixData)

    } else if (activeProvider === 'pushinpay') {
      // Para Pushin Pay, precisamos buscar a PaymentSession primeiro
      let paymentSession = await prisma.paymentSession.findFirst({
        where: {
          OR: [
            { preferenceId: preferenceId },
            { preferenceId: { contains: preferenceId } }
          ]
        },
      });

      if (!paymentSession) {
        return NextResponse.json(
          { error: 'PaymentSession não encontrada para Pushin Pay' },
          { status: 400 }
        )
      }

      // Configurar Pushin Pay
      const accessToken = await getProviderAccessToken('pushinpay')
      if (!accessToken) {
        return NextResponse.json(
          { error: 'Token de acesso do Pushin Pay não configurado' },
          { status: 500 }
        )
      }

      // Configurar webhook URL apenas para produção
      let webhookUrl: string | undefined = undefined
      
      if (process.env.NODE_ENV === 'production') {
        const baseUrl = process.env.HOST_URL || 'https://cornosbrasil.com'
        webhookUrl = `${baseUrl}/api/pushin-pay/webhook`
        console.log('🔗 Webhook configurado para PIX Premium (produção):', webhookUrl)
      } else {
        console.log('ℹ️ Webhook não configurado para desenvolvimento local')
      }

      // Preparar dados para o Pushin Pay
      const pixData: any = {
        value: Math.round(paymentSession.amount * 100), // Converter para centavos
        webhook_url: webhookUrl
      }

      // Fazer requisição para o Pushin Pay
      const response = await fetch('https://api.pushinpay.com.br/api/pix/cashIn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pixData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na API do Pushin Pay:', errorData)
        
        return NextResponse.json(
          { error: `Erro ao criar PIX: ${errorData.message || 'Erro desconhecido'}` },
          { status: response.status }
        )
      }

      const pixResponse = await response.json()
      
      console.log('📊 Resposta do Pushin Pay:', pixResponse)

      // Verificar se os dados necessários estão presentes
      if (!pixResponse.qr_code || !pixResponse.qr_code_base64) {
        console.error('❌ Dados do QR Code não encontrados na resposta:', pixResponse)
        return NextResponse.json(
          { error: 'QR Code não foi gerado pelo Pushin Pay' },
          { status: 500 }
        )
      }

      // Atualizar PaymentSession com o ID do PIX
      await prisma.paymentSession.update({
        where: { id: paymentSession.id },
        data: {
          paymentId: parseInt(pixResponse.id),
          preferenceId: pixResponse.id.toUpperCase(), // Salvar em maiúsculo para compatibilidade com webhook
          status: 'pending'
        }
      })

      console.log('✅ PIX Pushin Pay criado:', {
        id: pixResponse.id,
        value: pixResponse.value,
        status: pixResponse.status,
        paymentSessionId: paymentSession.id,
        qrCodePresent: !!pixResponse.qr_code,
        qrCodeBase64Present: !!pixResponse.qr_code_base64
      })

      return NextResponse.json({
        qr_code: pixResponse.qr_code,
        qr_code_base64: pixResponse.qr_code_base64, // Pushin Pay já entrega em base64
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        payment_id: pixResponse.id,
        provider: 'pushinpay' // Identificar o provedor para o frontend
      })

    } else {
      return NextResponse.json(
        { error: 'Provedor de pagamento não suportado' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao criar PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento PIX' },
      { status: 500 }
    )
  }
} 