import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

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
    console.log('✅ PIX criado com paymentId:', paymentId);

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
    }

    return NextResponse.json(pixData)
  } catch (error) {
    console.error('Erro ao criar PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento PIX' },
      { status: 500 }
    )
  }
} 