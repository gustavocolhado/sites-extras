import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIdString = searchParams.get('paymentId');

  // Verifica se o parâmetro paymentId foi fornecido
  if (!paymentIdString) {
    return NextResponse.json({ error: 'Parâmetro paymentId ausente.' }, { status: 400 });
  }

  // Converte o paymentIdString para um número inteiro
  const paymentId = parseInt(paymentIdString, 10);

  // Verifica se a conversão foi bem-sucedida
  if (isNaN(paymentId)) {
    return NextResponse.json({ error: 'paymentId inválido.' }, { status: 400 });
  }

  try {
    // Busca o pagamento no banco de dados pelo campo paymentId
    const payment = await prisma.payment.findFirst({
      where: { paymentId: paymentId }, // Usando paymentId para a busca
    });

    // Verifica se o pagamento foi encontrado
    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });
    }

    // Retorna o status do pagamento
    return NextResponse.json({ status: payment.status });
  } catch (error) {
    //console.error('Erro ao buscar o status do pagamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar o status do pagamento.' }, { status: 500 });
  }
}
