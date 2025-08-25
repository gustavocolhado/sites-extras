import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia', // Use a versão correta
    })
  : null;

// Função para processar a requisição POST do webhook
export async function POST(req: Request) {
  // Verificar se o Stripe está configurado
  if (!stripe) {
    console.error('Stripe não está configurado');
    return NextResponse.json({ error: 'Stripe não está configurado' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  const body = await req.arrayBuffer();
  const textBody = new TextDecoder().decode(body);

  let event;

  try {
    event = stripe.webhooks.constructEvent(textBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      try {
        if (session.metadata) {
          const { userId, plan, planId, amount, paymentSessionId, email, source, campaign } = session.metadata;

          // Aceitar tanto 'plan' quanto 'planId' e mapear corretamente
          let finalPlan = plan || planId;
          
          // Mapear planos para o formato correto
          const planMapping = {
            'premium_mensal': 'monthly',
            'premium_trimestral': 'quarterly', 
            'premium_semestral': 'semestral',
            'premium_anual': 'yearly',
            'premium_vitalicio': 'lifetime',
            'monthly': 'monthly',
            'quarterly': 'quarterly',
            'semestral': 'semestral',
            'yearly': 'yearly',
            'lifetime': 'lifetime'
          };

          finalPlan = planMapping[finalPlan as keyof typeof planMapping] || finalPlan;

          // Verificar se é pagamento da landing page (tem email mas não tem paymentSessionId)
          const isLandingPagePayment = email && !paymentSessionId;

          if (isLandingPagePayment) {
            // Processar pagamento da landing page
            console.log('🔄 Processando pagamento da Landing Page:', { email, finalPlan, amount });
            
            // Buscar usuário pelo email
            const user = await prisma.user.findUnique({
              where: { email }
            });

            if (!user) {
              console.error('❌ Usuário não encontrado para email:', email);
              return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
            }

            // Verificar se o usuário já tem senha definida (não é tempPassword)
            if (user.tempPassword) {
              console.log('⏳ Usuário ainda tem senha temporária, aguardando definição de senha');
              // Não ativar premium ainda, aguardar definição de senha
              return NextResponse.json({ 
                message: 'Pagamento processado, aguardando definição de senha',
                requiresPassword: true 
              });
            }

            // Usuário já tem senha, ativar premium
            const paymentDate = new Date();
            let expireDate: Date;

            // Definir a data de expiração
            switch (finalPlan) {
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
              where: { preferenceId: session.id },
            });

            if (existingPayment) {
              await prisma.payment.update({
                where: { id: existingPayment.id },
                data: {
                  status: 'paid',
                  plan: finalPlan,
                  amount: parseFloat(amount),
                },
              });
              console.log('✅ Pagamento atualizado para Landing Page');
            } else {
              await prisma.payment.create({
                data: {
                  userId: user.id,
                  plan: finalPlan,
                  amount: parseFloat(amount),
                  transactionDate: paymentDate,
                  userEmail: email,
                  status: 'paid',
                  preferenceId: session.id,
                },
              });
              console.log('✅ Novo pagamento criado para Landing Page');
            }

            // Atualizar usuário para premium
            await prisma.user.update({
              where: { id: user.id },
              data: {
                premium: true,
                expireDate: expireDate,
                paymentDate: paymentDate,
                paymentStatus: 'paid',
              },
            });

            console.log('✅ Usuário da Landing Page atualizado para premium:', { 
              userId: user.id, 
              email,
              expireDate 
            });

            return NextResponse.json({ 
              message: 'Pagamento da Landing Page processado com sucesso',
              userId: user.id 
            });

          } else {
            // Processar pagamento normal (com paymentSessionId)
            console.log('🔄 Processando pagamento normal:', { userId, finalPlan, amount, paymentSessionId });

            // Verifique os campos obrigatórios
            if (!userId || !finalPlan || !amount) {
              console.error('Metadata is missing required fields:', session.metadata);
              console.error('Processed metadata:', { userId, finalPlan, amount });
              return NextResponse.json({ error: 'Missing metadata fields.' }, { status: 400 });
            }

            console.log('✅ Metadata processada:', { userId, finalPlan, amount, paymentSessionId });

            // Buscar PaymentSession
            let paymentSession = null;
            if (paymentSessionId) {
              paymentSession = await prisma.paymentSession.findUnique({
                where: { id: paymentSessionId },
              });
            }

            if (!paymentSession) {
              // Tentar buscar por preferenceId
              paymentSession = await prisma.paymentSession.findFirst({
                where: { preferenceId: session.id },
              });
            }

            if (!paymentSession) {
              console.error('PaymentSession não encontrada para sessionId:', session.id);
              return NextResponse.json({ error: 'PaymentSession não encontrada.' }, { status: 404 });
            }

            console.log('✅ PaymentSession encontrada:', {
              id: paymentSession.id,
              plan: paymentSession.plan,
              amount: paymentSession.amount,
              userId: paymentSession.userId,
              status: paymentSession.status
            });

            const paymentDate = new Date();
            let expireDate: Date;

            // Definir a data de expiração com base no plano da PaymentSession
            switch (paymentSession.plan) {
              case 'monthly':
                expireDate = new Date(paymentDate);
                expireDate.setDate(paymentDate.getDate() + 30); // 30 dias
                break;
              case 'quarterly':
                expireDate = new Date(paymentDate);
                expireDate.setMonth(paymentDate.getMonth() + 3); // 3 meses
                break;
              case 'semestral':
                expireDate = new Date(paymentDate);
                expireDate.setMonth(paymentDate.getMonth() + 6); // 6 meses
                break;
              case 'yearly':
                expireDate = new Date(paymentDate);
                expireDate.setFullYear(paymentDate.getFullYear() + 1); // 1 ano
                break;
              case 'lifetime':
                expireDate = new Date(paymentDate);
                expireDate.setFullYear(paymentDate.getFullYear() + 100); // 100 anos
                break;
              default:
                expireDate = new Date(paymentDate); // data atual se plano não reconhecido
                break;
            }

            // Verificar se o pagamento já existe no banco de dados
            const existingPayment = await prisma.payment.findUnique({
              where: { preferenceId: session.id },
            });

            if (existingPayment) {
              // Atualizar o pagamento existente
              await prisma.payment.update({
                where: { preferenceId: session.id },
                data: {
                  status: 'paid',
                  plan: paymentSession.plan,
                  amount: paymentSession.amount,
                },
              });
              console.log(`✅ Pagamento atualizado com sucesso para userId: ${userId}`);
            } else {
              // Criar novo pagamento
              await prisma.payment.create({
                data: {
                  userId: paymentSession.userId,
                  plan: paymentSession.plan,
                  amount: paymentSession.amount,
                  transactionDate: paymentDate,
                  userEmail: session.customer_email || '',
                  status: 'paid',
                  preferenceId: session.id,
                },
              });
              console.log(`✅ Novo pagamento criado para userId: ${userId}`);
            }

            // Atualizar a PaymentSession
            await prisma.paymentSession.update({
              where: { id: paymentSession.id },
              data: {
                status: 'paid',
              },
            });
            console.log(`✅ PaymentSession atualizada com sucesso para userId: ${userId}`);

            // Atualizar o usuário com status premium
            await prisma.user.update({
              where: { id: paymentSession.userId },
              data: {
                premium: true,
                expireDate: expireDate,
                paymentDate: paymentDate,
                paymentStatus: 'paid',
              },
            });

            console.log(`✅ Usuário ${userId} atualizado para premium com expiração em ${expireDate}`);
          }
        } else {
          console.error('Metadata is null or undefined');
          return NextResponse.json({ error: 'Metadata is null or undefined.' }, { status: 400 });
        }
      } catch (error) {
        console.error('Erro ao registrar/atualizar o pagamento, usuário ou paymentSession:', error);
        return NextResponse.json({ error: 'Erro ao registrar/atualizar o pagamento, usuário ou paymentSession.' }, { status: 500 });
      }
      break;

    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}