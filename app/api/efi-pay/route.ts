import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { config } from 'dotenv';
import { resolve } from 'path';
import EfiPay from 'sdk-node-apis-efi'; // Importa a SDK da Efí

config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_PIX_KEY = process.env.EFI_PIX_KEY; // Chave Pix do recebedor
const EFI_API_URL = process.env.EFI_API_URL || 'https://pix-h.api.efipay.com.br'; // URL da API da Efí (homologação ou produção)
const EFI_CERT_PASSWORD = process.env.EFI_CERT_PASSWORD || ''; // Senha do certificado, se houver

if (!EFI_CLIENT_ID || !EFI_CLIENT_SECRET || !EFI_PIX_KEY) {
  throw new Error('Variáveis de ambiente EFI_CLIENT_ID, EFI_CLIENT_SECRET ou EFI_PIX_KEY não estão definidas.');
}

// Configuração da SDK da Efí
const options = {
  client_id: EFI_CLIENT_ID,
  client_secret: EFI_CLIENT_SECRET,
  certificate: resolve(process.cwd(), 'config', 'cert.p12'), // Caminho para o certificado .p12
  sandbox: EFI_API_URL.includes('pix-h.api.efipay.com.br'), // Define sandbox com base na URL da API
  // Se o certificado .p12 tiver senha, adicione:
  // passphrase: EFI_CERT_PASSWORD,
};

const efipay = new EfiPay(options);

export async function POST(request: Request) {
  try {
    const { userId, amount, payerEmail, paymentType, promotionCode, sessionId, payerCpf, payerName } = await request.json();

    if (!userId || !amount || !payerEmail || !paymentType || !payerCpf || !payerName) {
      return NextResponse.json({ error: 'Parâmetros ausentes.' }, { status: 400 });
    }

    // 1. Criar a cobrança imediata na Efí usando a SDK
    const chargePayload = {
      calendario: {
        expiracao: 3600 // 1 hora de expiração
      },
      devedor: {
        cpf: payerCpf,
        nome: payerName
      },
      valor: {
        original: amount.toFixed(2) // Formata o valor para duas casas decimais
      },
      chave: EFI_PIX_KEY!, // Usar non-null assertion operator
      solicitacaoPagador: `Pagamento para o site CBR para ${payerEmail} - Tipo: ${paymentType}`
    };

    const chargeResponse = await efipay.pixCreateImmediateCharge({}, chargePayload);

    const { pixCopiaECola, txid, loc, status } = chargeResponse; // Removido .data
    const qrCodeUrl = loc?.location; // A URL do QR Code está em loc.location

    if (pixCopiaECola && txid && qrCodeUrl) {
      console.log('🔍 PIX criado na Efí:', {
        txid,
        userId,
        plan: paymentType,
        amount,
        status,
        qrCodeUrl, // Adicionado para o log
        pixCopiaECola // Adicionado para o log
      });

      // Atualizar o usuário com as informações temporárias do PIX
      const updateResponse = await prisma.user.update({
        where: { id: userId },
        data: {
          paymentQrCodeUrl: qrCodeUrl,
          paymentPixCopiaECola: pixCopiaECola, // Salva o Pix Copia e Cola
          paymentTxid: txid, // Salva o txid
          paymentType: paymentType,
          paymentStatus: 'pending', // Status temporário até o webhook confirmar
        },
      });

      console.log('✅ Usuário atualizado com dados do PIX Efí:', {
        userId,
        paymentQrCodeUrl: qrCodeUrl,
        paymentPixCopiaECola: pixCopiaECola,
        paymentTxid: txid,
        paymentType,
        paymentStatus: 'pending'
      });

      return NextResponse.json({ qrCodeUrl, pixCopiaECola, txid, paymentStatus: status, loc });
    } else {
      throw new Error('Falha ao criar a cobrança: QR Code, Pix Copia e Cola ou Txid não encontrado.');
    }

  } catch (error) {
    console.error('Erro na Efí:', error); // Loga o erro completo da SDK
    return NextResponse.json({ error: (error as Error).message || 'Erro inesperado.' }, { status: 500 });
  }
}
