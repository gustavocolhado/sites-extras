import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔔 Webhook Mercado Pago recebido:', {
      action: body.action,
      paymentId: body.data?.id,
      status: body.data?.status,
      date: body.date_created
    });

    const { action, data, date_created } = body;

    if (action === 'payment.updated') {
      const paymentId = parseInt(data.id); // Converte o ID para número inteiro

      if (!paymentId) {
        console.error('❌ ID do pagamento não fornecido.');
        return NextResponse.json({ error: 'ID do pagamento não fornecido.' }, { status: 400 });
      }

      console.log('🔍 Processando webhook para paymentId:', paymentId);

      // Primeiro, tentar buscar informações do pagamento na API do Mercado Pago
      let paymentInfo = null;
      try {
        const { MercadoPagoConfig, Payment } = await import('mercadopago');
        const mercadopago = new MercadoPagoConfig({
          accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
        });
        
        const paymentClient = new Payment(mercadopago);
        paymentInfo = await paymentClient.get({ id: paymentId });
        
        console.log('✅ Informações do pagamento obtidas da API:', {
          id: paymentInfo.id,
          status: paymentInfo.status,
          transaction_amount: paymentInfo.transaction_amount,
          payer_email: paymentInfo.payer?.email,
          external_reference: paymentInfo.external_reference
        });
      } catch (apiError) {
        console.error('❌ Erro ao buscar informações do pagamento na API:', apiError);
      }

      // Buscar PaymentSession usando diferentes estratégias
      let paymentSession = null;

      // 1. Tentar buscar por external_reference direto (formato: userId_plan_paymentSessionId)
      if (paymentInfo?.external_reference) {
        console.log('🔍 Tentando buscar PaymentSession por external_reference:', paymentInfo.external_reference);
        
        // O external_reference pode ter dois formatos:
        // a) userId_plan_paymentSessionId (formato premium e landing page)
        // b) paymentSessionId (formato antigo)
        
        const parts = paymentInfo.external_reference.split('_');
        if (parts.length >= 3) {
          // Formato: userId_plan_paymentSessionId
          const paymentSessionId = parts[parts.length - 1];
          console.log('🔍 Tentando buscar PaymentSession por ID do external_reference:', paymentSessionId);
          
          // Verificar se o paymentSessionId é um ObjectId válido
          const objectIdRegex = /^[0-9a-fA-F]{24}$/;
          if (objectIdRegex.test(paymentSessionId)) {
            paymentSession = await prisma.paymentSession.findUnique({
              where: { id: paymentSessionId }
            });
            
            if (paymentSession) {
              console.log('✅ PaymentSession encontrada por ID do external_reference:', paymentSession.id);
            }
          } else {
            console.log('⚠️ PaymentSessionId não é um ObjectId válido:', paymentSessionId);
          }
        } else {
          // Formato: paymentSessionId (formato antigo)
          const objectIdRegex = /^[0-9a-fA-F]{24}$/;
          if (objectIdRegex.test(paymentInfo.external_reference)) {
            paymentSession = await prisma.paymentSession.findUnique({
              where: { id: paymentInfo.external_reference }
            });
            
            if (paymentSession) {
              console.log('✅ PaymentSession encontrada por external_reference (formato antigo):', paymentSession.id);
            }
          } else {
            console.log('⚠️ External reference não é um ObjectId válido:', paymentInfo.external_reference);
          }
        }
      }

      // 2. Tentar buscar por paymentId na PaymentSession
      if (!paymentSession) {
        console.log('🔍 Tentando buscar PaymentSession por paymentId:', paymentId);
        paymentSession = await prisma.paymentSession.findFirst({
          where: { paymentId: paymentId }
        });
        
        if (paymentSession) {
          console.log('✅ PaymentSession encontrada por paymentId:', paymentSession.id);
        }
      }

      // 3. Se ainda não encontrou e temos o email do pagador, criar uma nova PaymentSession
      if (!paymentSession && paymentInfo?.payer?.email) {
        console.log('🔍 Tentando criar PaymentSession baseada no email do pagador:', paymentInfo.payer.email);
        
        const user = await prisma.user.findFirst({
          where: { email: paymentInfo.payer.email }
        });
        
        if (user) {
          // Determinar o plano baseado no valor
          let plan = 'monthly';
          const amount = paymentInfo.transaction_amount || 0;
          
          if (amount >= 149.90) {
            plan = 'yearly';
          } else if (amount >= 99.90) {
            plan = 'semestral';
          } else if (amount >= 69.90) {
            plan = 'quarterly';
          } else if (amount >= 29.90) {
            plan = 'monthly';
          } else {
            plan = 'lifetime'; // Para valores baixos como 0.50
          }
          
          console.log('🔍 Criando PaymentSession com plano:', plan, 'e valor:', amount);
          
          try {
            paymentSession = await prisma.paymentSession.create({
              data: {
                plan: plan,
                amount: amount,
                userId: user.id,
                status: 'pending',
              },
            });
            
            console.log('✅ PaymentSession criada via webhook:', paymentSession.id);
          } catch (error) {
            console.error('❌ Erro ao criar PaymentSession:', error);
          }
        } else {
          console.warn('⚠️ Usuário não encontrado com o email:', paymentInfo.payer.email);
        }
      }

      if (!paymentSession) {
        console.error('❌ Nenhuma PaymentSession encontrada para o paymentId:', paymentId);
        return NextResponse.json({ error: 'PaymentSession não encontrada.' }, { status: 404 });
      }

      console.log('✅ PaymentSession encontrada:', {
        id: paymentSession.id,
        plan: paymentSession.plan,
        amount: paymentSession.amount,
        userId: paymentSession.userId,
        status: paymentSession.status,
        paymentId: paymentSession.paymentId
      });

      const paymentStatus = paymentInfo?.status || data.status || 'paid';
      const paymentDate = new Date(date_created);
      let expireDate: Date | null = null;

      // Verificar se o pagamento foi realmente aprovado/pago
      const isPaymentApproved = paymentStatus === 'approved' || paymentStatus === 'paid';
      
      if (!isPaymentApproved) {
        console.log('ℹ️ Pagamento não aprovado ainda. Status:', paymentStatus);
        // Atualizar apenas o status da PaymentSession, mas não processar como pago
        await prisma.paymentSession.update({
          where: { id: paymentSession.id },
          data: {
            status: paymentStatus,
            paymentId: paymentId, // Cadastrar o paymentId mesmo que não aprovado
          },
        });
        
        console.log('✅ PaymentSession atualizada com status:', paymentStatus);
        return NextResponse.json({ message: 'Webhook processado - pagamento não aprovado ainda' });
      }

      console.log('✅ Pagamento aprovado! Processando...');

      // Define a data de expiração com base no tipo de plano da PaymentSession
      switch (paymentSession.plan) {
        case 'monthly':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 1);
          break;
        case 'quarterly':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 3);
          break;
        case 'semestral':
          expireDate = new Date(paymentDate);
          expireDate.setMonth(expireDate.getMonth() + 6);
          break;
        case 'yearly':
          expireDate = new Date(paymentDate);
          expireDate.setFullYear(expireDate.getFullYear() + 1);
          break;
        case 'lifetime':
          expireDate = new Date(paymentDate);
          expireDate.setFullYear(expireDate.getFullYear() + 100);
          break;
        default:
          console.warn('⚠️ Tipo de plano desconhecido:', paymentSession.plan);
      }

      console.log('📅 Data de expiração calculada:', expireDate);

      // Criar ou atualizar o Payment baseado na PaymentSession
      let payment = await prisma.payment.findFirst({
        where: { paymentId: paymentId },
      });

      if (payment) {
        // Atualizar o pagamento existente
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus,
            plan: paymentSession.plan,
            amount: paymentSession.amount,
          },
        });
        console.log('✅ Payment atualizado:', payment.id);
      } else {
        // Criar novo pagamento apenas quando aprovado
        payment = await prisma.payment.create({
          data: {
            userId: paymentSession.userId,
            plan: paymentSession.plan,
            amount: paymentSession.amount,
            paymentId: paymentId,
            transactionDate: paymentDate,
            userEmail: paymentInfo?.payer?.email || '',
            status: paymentStatus,
            preferenceId: paymentSession.preferenceId,
          },
        });
        console.log('✅ Payment criado:', payment.id);
      }

      // Atualizar a PaymentSession com o paymentId do Mercado Pago
      console.log('🔍 Atualizando PaymentSession com paymentId:', paymentId);
      
      const updatedPaymentSession = await prisma.paymentSession.update({
        where: { id: paymentSession.id },
        data: {
          status: paymentStatus,
          paymentId: paymentId, // Cadastrar o paymentId do Mercado Pago
        },
      });

      console.log('✅ PaymentSession atualizada com paymentId:', {
        id: updatedPaymentSession.id,
        paymentId: updatedPaymentSession.paymentId,
        status: updatedPaymentSession.status
      });

      // Atualizar o usuário associado apenas quando o pagamento for aprovado
      const user = await prisma.user.findUnique({
        where: { id: paymentSession.userId },
      });

      if (user) {
        const updateData: any = {
          paymentStatus: paymentStatus,
          premium: true,
          paymentDate: paymentDate,
          expireDate: expireDate,
          paymentId: paymentId, // Também atualizar o paymentId no usuário
        };

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        console.log('✅ Usuário atualizado:', {
          userId: user.id,
          email: user.email,
          premium: true,
          expireDate: expireDate,
          paymentId: paymentId
        });
      } else {
        console.warn('❌ Nenhum usuário encontrado com o userId:', paymentSession.userId);
      }
    } else {
      console.log('ℹ️ Webhook ignorado - ação:', action);
    }

    return NextResponse.json({ message: 'Webhook processado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao processar o webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar o webhook' }, { status: 500 });
  }
}