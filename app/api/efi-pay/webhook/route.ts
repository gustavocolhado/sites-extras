import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { config } from 'dotenv';
import { resolve } from 'path';
import EfiPay from 'sdk-node-apis-efi';

config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_PIX_KEY = process.env.EFI_PIX_KEY;
const EFI_API_URL = process.env.EFI_API_URL || 'https://pix-h.api.efipay.com.br';
const EFI_CERT_PASSWORD = process.env.EFI_CERT_PASSWORD || '';

if (!EFI_CLIENT_ID || !EFI_CLIENT_SECRET || !EFI_PIX_KEY) {
  throw new Error('Variáveis de ambiente EFI_CLIENT_ID, EFI_CLIENT_SECRET ou EFI_PIX_KEY não estão definidas.');
}

const options = {
  client_id: EFI_CLIENT_ID,
  client_secret: EFI_CLIENT_SECRET,
  certificate: resolve(process.cwd(), 'config', 'cert.p12'),
  sandbox: EFI_API_URL.includes('pix-h.api.efipay.com.br'),
};

const efipay = new EfiPay(options);

// Endereço IP da Efí para validação (produção)
const EFI_WEBHOOK_IP = '34.193.116.226'; // Verifique a documentação da Efí para o IP mais recente

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for'); // Obter IP do cliente

    // 1. Validação de IP (medida de segurança para skip-mTLS)
    // É importante que o ambiente de hospedagem configure corretamente o cabeçalho x-forwarded-for
    if (!clientIp || clientIp !== EFI_WEBHOOK_IP) {
      console.warn(`Webhook recebido de IP não autorizado: ${clientIp}`);
      return NextResponse.json({ error: 'Unauthorized IP' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Webhook Efí recebido:', body);

    // A Efí envia um array de Pix em caso de notificações de cobrança
    const pixNotifications = body.pix || [];

    for (const pix of pixNotifications) {
      const { endToEndId, txid, valor, horario, pagador, infoPagador } = pix;
      const status = body.status; // O status da cobrança é geralmente no nível superior do body

      console.log(`Processando notificação Pix para txid: ${txid}, status: ${status}`);

      // Buscar o usuário associado a este txid
      const user = await prisma.user.findFirst({
        where: { paymentTxid: txid },
      });

      if (user) {
        // Atualizar o status do pagamento do usuário
        await prisma.user.update({
          where: { id: user.id },
          data: {
            paymentStatus: status === 'CONCLUIDA' ? 'paid' : 'pending', // Ou outros status conforme sua lógica
            // Você pode adicionar mais campos aqui com base nos dados do webhook
            // Ex: paymentAmountPaid: parseFloat(valor),
            // Ex: paymentPaidAt: new Date(horario),
          },
        });
        console.log(`✅ Status do usuário ${user.id} atualizado para ${status}`);
      } else {
        console.warn(`Usuário não encontrado para o txid: ${txid}`);
      }
    }

    return NextResponse.json({ message: 'Webhook processado com sucesso.' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao processar webhook Efí:', error);
    return NextResponse.json({ error: (error as Error).message || 'Erro inesperado no webhook.' }, { status: 500 });
  }
}

// A função para registrar o webhook na Efí será implementada separadamente,
// pois a SDK não parece suportar o cabeçalho 'x-skip-mtls-checking' diretamente no método pixConfigWebhook.
// Será necessário fazer uma requisição HTTP manual para registrar o webhook com este cabeçalho.
// export async function registerEfiWebhook(webhookUrl: string, pixKey: string) {
//   try {
//     const params = {
//       chave: pixKey,
//     };
//     const body = {
//       webhookUrl: webhookUrl + '?ignorar=', // Adiciona ?ignorar= conforme documentação
//     };
//     const headers = {
//       'x-skip-mtls-checking': 'true', // Habilita skip-mTLS
//     };

//     const response = await efipay.pixConfigWebhook(params, body, headers);
//     console.log('Webhook Efí registrado com sucesso:', response);
//     return response;
//   } catch (error) {
//     console.error('Erro ao registrar webhook Efí:', error);
//     throw error;
//   }
// }
