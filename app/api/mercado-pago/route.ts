import { NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { config } from 'dotenv';

// Carrega as variáveis do .env
config();

// Acessa o token da variável de ambiente
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com/v1/payments';

export async function POST(request: Request) {
  try {
    // Captura os dados da requisição, incluindo o paymentType
    const { userId, amount, payerEmail, paymentType, promotionCode, sessionId, source, campaign } = await request.json();

    // Verifica a presença de todos os parâmetros, incluindo o paymentType
    if (!userId || !amount || !payerEmail || !paymentType) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    // 1. Criar uma PaymentSession inicial no banco de dados
    const newPaymentSession = await prisma.paymentSession.create({
      data: {
        userId: userId,
        amount: amount,
        plan: paymentType,
        status: 'pending',
        paymentMethod: 'mercadopago',
        userEmail: payerEmail,
        promotionCode: promotionCode,
        affiliateId: sessionId, // Se sessionId for o affiliateId
        source: source,
        campaign: campaign,
      },
    });

    console.log('✅ PaymentSession inicial criada:', newPaymentSession.id);

    // Verifica se o token de acesso do Mercado Pago está configurado
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não está configurado nas variáveis de ambiente.');
      return NextResponse.json({ error: 'Configuração do provedor de pagamento ausente.' }, { status: 500 });
    }

    // Gera um valor único para o cabeçalho X-Idempotency-Key
    const idempotencyKey = `user_${userId}_payment_${newPaymentSession.id}`; // Usar o ID da PaymentSession

    // Define a descrição do pagamento com base no tipo de plano
    const description = `Pagamento para o site CBR para ${payerEmail}`;

    // Faz a requisição para criar o pagamento
    const paymentResponse = await axios.post(MERCADO_PAGO_API_URL, {
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix',
      payer: {
        email: payerEmail,
      },
      external_reference: newPaymentSession.id, // Usar o ID da PaymentSession como external_reference
    }, {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
    });

    // Verifica se o pagamento foi criado com sucesso
    const qr_code = paymentResponse.data.point_of_interaction?.transaction_data?.qr_code;
    const qr_code_base64 = paymentResponse.data.point_of_interaction?.transaction_data?.qr_code_base64;
    const paymentId = paymentResponse.data.id;
    const paymentStatus = paymentResponse.data.status;
    const expires_at = paymentResponse.data.date_of_expiration; // Adicionado expires_at

    if (qr_code && qr_code_base64 && paymentId) {
      console.log('🔍 PIX criado no Mercado Pago:', {
        paymentId,
        userId,
        plan: paymentType,
        amount,
        status: paymentStatus,
        paymentSessionId: newPaymentSession.id // Adicionado para debug
      });

      // 3. Atualizar a PaymentSession com o paymentId e preferenceId do Mercado Pago
      await prisma.paymentSession.update({
        where: { id: newPaymentSession.id },
        data: {
          paymentId: paymentId,
          preferenceId: paymentResponse.data.id.toString(), // O ID da preferência é o próprio paymentId para PIX
          status: paymentStatus, // Deve ser 'pending' inicialmente
        },
      });

      console.log('✅ PaymentSession atualizada com paymentId e preferenceId:', {
        paymentSessionId: newPaymentSession.id,
        paymentId: paymentId,
        preferenceId: paymentResponse.data.id.toString(),
        status: paymentStatus
      });

      // Apenas atualizar o usuário com as informações temporárias do PIX
      await prisma.user.update({
        where: { id: userId },
        data: {
          paymentQrCodeUrl: qr_code, // Usar qr_code para o URL/código copia e cola
          paymentType: paymentType,
          paymentStatus: 'pending', // Status temporário até o webhook confirmar
          paymentId: paymentId, // Salvar o paymentId no usuário também
        },
      });

      console.log('✅ Usuário atualizado com dados do PIX:', {
        userId,
        paymentQrCodeUrl: qr_code,
        paymentType,
        paymentStatus: 'pending',
        paymentId: paymentId
      });

      // Retornar qr_code, qr_code_base64 e expires_at
      return NextResponse.json({ qr_code, qr_code_base64, paymentId, paymentStatus, expires_at, paymentSessionId: newPaymentSession.id });
    } else {
      throw new Error('Falha ao criar o pagamento: QR Code, QR Code Base64 ou Payment ID não encontrado.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro Axios:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : undefined,
      });
    } else if (error instanceof Error) {
      console.error('Erro:', error.message);
    } else {
      console.error('Erro inesperado:', error);
    }
    return NextResponse.json({ error: (error as Error).message || 'Erro inesperado.' }, { status: 500 });
  }
}
