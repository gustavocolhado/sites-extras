// app/api/stripe/webhook/status/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia', // Use a versão correta
    })
  : null;

export async function GET(req: Request) {
    // Verificar se o Stripe está configurado
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe não está configurado',
        confirmed: false,
        status: 'error'
      }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
  
    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id é obrigatório.' }, { status: 400 });
    }
  
    try {
      // Busca a sessão de checkout usando a Stripe API
      const session = await stripe.checkout.sessions.retrieve(session_id);
  
      // Verifica o status da sessão no Stripe
      const stripePaymentStatus = session.payment_status;
      const stripeStatus = session.status;
      
      // Verifica se o pagamento foi confirmado no Stripe
      const isStripeConfirmed = stripePaymentStatus === 'paid' && stripeStatus === 'complete';
      
      // Busca o pagamento no banco de dados local
      const localPayment = await prisma.payment.findFirst({
        where: { preferenceId: session_id },
      });
      
      // Busca também na PaymentSession
      const paymentSession = await prisma.paymentSession.findFirst({
        where: { preferenceId: session_id },
      });
      
      // Verifica se o webhook foi processado (pagamento existe no banco e está como 'paid')
      const isWebhookProcessed = localPayment?.status === 'paid' || paymentSession?.status === 'paid';
      
      // Verifica se o usuário foi atualizado para premium
      let isUserPremium = false;
      if (localPayment?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: localPayment.userId },
          select: { premium: true, expireDate: true }
        });
        isUserPremium = user?.premium === true;
      }
      
      // Determina o status final
      let finalStatus = 'pending';
      let confirmed = false;
      let message = '';
      
      if (isStripeConfirmed && isWebhookProcessed && isUserPremium) {
        finalStatus = 'confirmed';
        confirmed = true;
        message = 'Pagamento confirmado e processado com sucesso';
      } else if (isStripeConfirmed && !isWebhookProcessed) {
        finalStatus = 'pending';
        confirmed = false;
        message = 'Pagamento confirmado no Stripe, aguardando processamento';
      } else if (isStripeConfirmed && isWebhookProcessed && !isUserPremium) {
        finalStatus = 'pending';
        confirmed = false;
        message = 'Pagamento processado, aguardando ativação do premium';
      } else if (!isStripeConfirmed) {
        finalStatus = 'pending';
        confirmed = false;
        message = 'Pagamento ainda não confirmado no Stripe';
      }
      
      console.log('Status check for session_id:', session_id, {
        stripePaymentStatus,
        stripeStatus,
        isStripeConfirmed,
        isWebhookProcessed,
        isUserPremium,
        finalStatus,
        confirmed
      });
  
      return NextResponse.json({
        status: finalStatus,
        confirmed,
        message,
        stripe_status: stripePaymentStatus,
        stripe_session_status: stripeStatus,
        webhook_processed: isWebhookProcessed,
        user_premium: isUserPremium,
        session_id: session_id
      });
    } catch (error) {
      console.error('Erro ao buscar a sessão de checkout:', error);
      return NextResponse.json({ 
        error: 'Erro ao buscar o status do pagamento.',
        confirmed: false,
        status: 'error'
      }, { status: 500 });
    }
  }