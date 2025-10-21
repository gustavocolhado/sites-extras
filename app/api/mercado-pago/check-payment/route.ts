import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento não fornecido.' }, { status: 400 });
    }

    const mercadopago = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });
    
    const paymentClient = new Payment(mercadopago);
    const paymentInfo = await paymentClient.get({ id: paymentId });

    return NextResponse.json({ status: paymentInfo.status });

  } catch (error) {
    console.error('❌ Erro ao verificar o pagamento:', error);
    return NextResponse.json({ error: 'Erro ao verificar o pagamento.' }, { status: 500 });
  }
}
