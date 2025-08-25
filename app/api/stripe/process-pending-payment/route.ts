import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    // Verificar se o Stripe está configurado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não está configurado' },
        { status: 500 }
      )
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId é obrigatório' }, { status: 400 });
    }

    console.log('🔄 Processando pagamento pendente para sessionId:', sessionId);

    // Buscar a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid' || session.status !== 'complete') {
      return NextResponse.json({ 
        error: 'Pagamento não foi confirmado no Stripe',
        status: session.payment_status,
        sessionStatus: session.status
      }, { status: 400 });
    }

    // Buscar PaymentSession
    const paymentSession = await prisma.paymentSession.findFirst({
      where: { preferenceId: sessionId },
    });

    if (!paymentSession) {
      return NextResponse.json({ error: 'PaymentSession não encontrada' }, { status: 404 });
    }

    console.log('✅ PaymentSession encontrada:', paymentSession);

    const paymentDate = new Date();
    let expireDate: Date;

    // Definir a data de expiração
    switch (paymentSession.plan) {
      case 'monthly':
        expireDate = new Date(paymentDate);
        expireDate.setDate(paymentDate.getDate() + 30);
        break;
      case 'quarterly':
        expireDate = new Date(paymentDate);
        expireDate.setMonth(paymentDate.getMonth() + 3);
        break;
      case 'semestral':
        expireDate = new Date(paymentDate);
        expireDate.setMonth(paymentDate.getMonth() + 6);
        break;
      case 'yearly':
        expireDate = new Date(paymentDate);
        expireDate.setFullYear(paymentDate.getFullYear() + 1);
        break;
      case 'lifetime':
        expireDate = new Date(paymentDate);
        expireDate.setFullYear(paymentDate.getFullYear() + 100);
        break;
      default:
        expireDate = new Date(paymentDate);
        break;
    }

    // Criar ou atualizar pagamento
    const existingPayment = await prisma.payment.findFirst({
      where: { preferenceId: sessionId },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'paid',
          plan: paymentSession.plan,
          amount: paymentSession.amount,
        },
      });
      console.log('✅ Pagamento atualizado');
    } else {
      await prisma.payment.create({
        data: {
          userId: paymentSession.userId,
          plan: paymentSession.plan,
          amount: paymentSession.amount,
          transactionDate: paymentDate,
          userEmail: session.customer_email || '',
          status: 'paid',
          preferenceId: sessionId,
        },
      });
      console.log('✅ Novo pagamento criado');
    }

    // Atualizar PaymentSession
    await prisma.paymentSession.update({
      where: { id: paymentSession.id },
      data: { status: 'paid' },
    });
    console.log('✅ PaymentSession atualizada');

    // Atualizar usuário para premium
    await prisma.user.update({
      where: { id: paymentSession.userId },
      data: {
        premium: true,
        expireDate: expireDate,
        paymentDate: paymentDate,
        paymentStatus: 'paid',
      },
    });
    console.log('✅ Usuário atualizado para premium');

    return NextResponse.json({
      success: true,
      message: 'Pagamento processado com sucesso',
      userId: paymentSession.userId,
      plan: paymentSession.plan,
      expireDate: expireDate
    });

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar pagamento',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
