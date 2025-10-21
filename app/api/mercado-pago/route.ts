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
    const { userId, amount, payerEmail, paymentType, promotionCode } = await request.json();

    // Verifica a presença de todos os parâmetros, incluindo o paymentType
    if (!userId || !amount || !payerEmail || !paymentType) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    // 1. Criar uma PaymentSession inicial no banco de dados
    const initialPaymentSession = await prisma.paymentSession.create({
      data: {
        userId: userId,
        plan: paymentType,
        amount: amount,
        status: 'pending',
        // Outros campos podem ser adicionados aqui se necessário
      },
    });

    console.log('✅ PaymentSession inicial criada:', initialPaymentSession.id);

    // O external_reference será o ID da PaymentSession para que o webhook possa encontrá-la
    const externalReference = initialPaymentSession.id;

    // Verifica se o token de acesso do Mercado Pago está configurado
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não está configurado nas variáveis de ambiente.');
      return NextResponse.json({ error: 'Configuração do provedor de pagamento ausente.' }, { status: 500 });
    }

    // Gera um valor único para o cabeçalho X-Idempotency-Key
    const idempotencyKey = `user_${userId}_payment_${Date.now()}`;

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
      external_reference: externalReference, // Adicionar o external_reference
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
        status: paymentStatus
      });

      console.log('🔍 PIX criado no Mercado Pago:', {
        paymentId,
        userId,
        plan: paymentType,
        amount,
        status: paymentStatus,
        paymentSessionId: initialPaymentSession.id // Adicionar o ID da PaymentSession
      });

      // 2. Atualizar a PaymentSession com o paymentId e preferenceId
      const updatedPaymentSession = await prisma.paymentSession.update({
        where: { id: initialPaymentSession.id },
        data: {
          paymentId: paymentId,
          preferenceId: paymentId.toString(), // Para PIX, preferenceId pode ser o mesmo que paymentId
          status: paymentStatus, // Status inicial do Mercado Pago (geralmente 'pending')
        },
      });

      console.log('✅ PaymentSession atualizada com paymentId e preferenceId:', {
        paymentSessionId: updatedPaymentSession.id,
        paymentId: paymentId, // Corrigido para usar paymentId
        preferenceId: updatedPaymentSession.preferenceId,
        status: updatedPaymentSession.status
      });

      // 3. Atualizar o usuário com as informações temporárias do PIX
      const updateResponse = await prisma.user.update({
        where: { id: userId },
        data: {
          paymentQrCodeUrl: qr_code, // Usar qr_code para o URL/código copia e cola
          paymentType: paymentType,
          paymentStatus: 'pending', // Status temporário até o webhook confirmar
          paymentId: paymentId, // Adicionar paymentId ao usuário também
        },
      });

      console.log('✅ Usuário atualizado com dados do PIX:', {
        userId,
        paymentQrCodeUrl: qr_code,
        paymentType,
        paymentStatus: 'pending'
      });

      // Retornar qr_code, qr_code_base64 e expires_at
      return NextResponse.json({ qr_code, qr_code_base64, paymentId, paymentStatus, expires_at });
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
