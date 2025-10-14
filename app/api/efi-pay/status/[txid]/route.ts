import { NextResponse } from 'next/server';
import axios from 'axios';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { Agent } from 'https';
import { resolve } from 'path';

config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_API_URL = process.env.EFI_API_URL || 'https://pix-h.api.efipay.com.br'; // URL da API da Efí (homologação ou produção)
const EFI_CERT_PASSWORD = process.env.EFI_CERT_PASSWORD || ''; // Senha do certificado, se houver

// Carregar o certificado .pem
let httpsAgent: Agent | undefined;
try {
  const certPath = resolve(process.cwd(), 'config', 'cert.pem');
  const certContent = readFileSync(certPath);
  httpsAgent = new Agent({
    key: certContent, // Assumindo que o .pem contém a chave privada
    cert: certContent, // Assumindo que o .pem contém o certificado
    // Se o seu arquivo .pem for protegido por senha, descomente a linha abaixo e defina EFI_CERT_PASSWORD
    // passphrase: EFI_CERT_PASSWORD,
  });
} catch (e) {
  console.error('❌ Erro ao carregar o certificado EFI:', e);
  // Em ambiente de desenvolvimento ou homologação, pode-se prosseguir sem o certificado
  // Em produção, isso deve ser um erro fatal
}

export async function GET(request: Request, { params }: { params: { txid: string } }) {
  try {
    const { txid } = params;

    if (!txid) {
      return NextResponse.json({ error: 'Txid ausente.' }, { status: 400 });
    }

    // 1. Obter o token de autenticação da Efí
    const credentials = Buffer.from(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`).toString('base64');
    const authResponse = await axios.post(`${EFI_API_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'cob.read' // Escopo para leitura de cobranças
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent, // Usar o agente HTTPS com o certificado
      }
    );

    const accessToken = authResponse.data.access_token;

    // 2. Consultar a cobrança na Efí
    const chargeResponse = await axios.get(`${EFI_API_URL}/v2/cob/${txid}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      httpsAgent, // Usar o agente HTTPS com o certificado
    });

    const { status, pixCopiaECola, loc } = chargeResponse.data;
    const qrCodeUrl = loc?.location;

    console.log('🔍 Status da cobrança Efí:', { txid, status });

    return NextResponse.json({ txid, status, pixCopiaECola, qrCodeUrl });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro Axios na consulta Efí:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : undefined,
      });
    } else if (error instanceof Error) {
      console.error('Erro na consulta Efí:', error.message);
    } else {
      console.error('Erro inesperado na consulta Efí:', error);
    }
    return NextResponse.json({ error: (error as Error).message || 'Erro inesperado.' }, { status: 500 });
  }
}
