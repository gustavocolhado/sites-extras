import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    })
  : null;

export async function POST(req: Request) {
  // Verificar se o Stripe está configurado
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe não está configurado' },
      { status: 500 }
    )
  }

  const { userId, amount, payerEmail, paymentType, locale, promotionCode, sessionId } = await req.json();

  // Verificações de dados
  if (!userId || !amount || !payerEmail || !paymentType) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  // Validar e converter o amount
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: 'Valor inválido para amount.' }, { status: 400 });
  }

  // Log para depuração
  console.log('Valor recebido (amount):', parsedAmount);

  const currency = locale === 'en' ? 'usd' : locale === 'es' ? 'eur' : 'brl';
  const connectedAccount = process.env.STRIPE_CONNECTED_ACCOUNT;

  if (!connectedAccount) {
    return NextResponse.json({ error: 'Conta conectada não configurada.' }, { status: 500 });
  }

  try {
    // O amount recebido já está em centavos (ex.: 1790 = 17,90 BRL)
    const unitAmount = Math.round(parsedAmount); // Usa o valor diretamente como centavos
    console.log('Valor enviado para Stripe (unit_amount):', unitAmount);

    // Criar uma sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Assinatura ${paymentType}`,
            },
            unit_amount: unitAmount, // Ex.: 1790 centavos = 17,90 BRL
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.HOST_URL}/dashboard/subscribe/card-payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.HOST_URL}/dashboard/subscribe`,
      metadata: {
        userId: userId,
        plan: paymentType,
        amount: parsedAmount / 100, // Armazena em unidades para consistência
      },
    });

    // Criar o registro no banco de dados
    await prisma.payment.create({
      data: {
        userId,
        plan: paymentType,
        amount: parsedAmount / 100, // Converte para unidades (ex.: 1790 -> 17.9)
        status: 'pending',
        preferenceId: session.id,
        userEmail: payerEmail,
        ...(promotionCode && { promotionCode }),
      },
    });

    // Atualiza o registro na tabela paymentSession
    await prisma.paymentSession.update({
      where: {
        id: sessionId,
      },
      data: {
        preferenceId: session.id,
        status: 'pending',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
}