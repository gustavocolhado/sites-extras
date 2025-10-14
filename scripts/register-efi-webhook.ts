import axios from 'axios';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { Agent, AgentOptions } from 'https';
import { resolve } from 'path';

config();

const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID;
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const EFI_PIX_KEY = process.env.EFI_PIX_KEY;
const EFI_API_URL = process.env.EFI_API_URL || 'https://api.efipay.com.br'; // Usar URL de produção por padrão

if (!EFI_CLIENT_ID || !EFI_CLIENT_SECRET || !EFI_PIX_KEY) {
  console.error('Erro: Variáveis de ambiente EFI_CLIENT_ID, EFI_CLIENT_SECRET ou EFI_PIX_KEY não estão definidas.');
  process.exit(1);
}

// Carregar o certificado .p12
let httpsAgent: Agent | undefined;
try {
  const certPath = resolve(process.cwd(), 'config', 'cert.p12');
  const certContent = readFileSync(certPath); // Conteúdo binário do .p12
  
  const agentOptions: AgentOptions = {
    pfx: certContent, // Usar pfx para certificado .p12
    passphrase: process.env.EFI_CERT_PASSWORD || '', // Senha do certificado, se houver
    secureProtocol: 'TLSv1_2_method', // Força o uso de TLS 1.2
  };

  httpsAgent = new Agent(agentOptions);
  console.log(`✅ Certificado EFI .p12 carregado com sucesso de: ${certPath}`);
} catch (e) {
  const certPath = resolve(process.cwd(), 'config', 'cert.p12');
  console.error(`❌ Erro ao carregar o certificado EFI .p12 de ${certPath}:`, e);
  process.exit(1);
}

export async function registerEfiWebhook(webhookUrl: string, pixKey: string) {
  try {
    // 1. Obter o token de autenticação da Efí
    const credentials = Buffer.from(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`).toString('base64');
    const authResponse = await axios.post(`${EFI_API_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'webhook.write' // Escopo necessário para registrar webhook
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent,
        timeout: 10000,
      }
    );

    const accessToken = authResponse.data.access_token;

    // 2. Registrar o webhook na Efí
    const webhookConfigResponse = await axios.put(`${EFI_API_URL}/v2/webhook/${pixKey}`,
      {
        webhookUrl: webhookUrl + '?ignorar=', // Adiciona ?ignorar= conforme documentação
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-skip-mtls-checking': 'true', // Habilita skip-mTLS
        },
        httpsAgent,
        timeout: 10000,
      }
    );

    console.log('Webhook Efí registrado com sucesso:', webhookConfigResponse.data);
    return webhookConfigResponse.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro Axios ao registrar webhook Efí:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : undefined,
      });
    } else if (error instanceof Error) {
      console.error('Erro ao registrar webhook Efí:', error.message);
    } else {
      console.error('Erro inesperado ao registrar webhook Efí:', error);
    }
    throw error;
  }
}

// Exemplo de uso (pode ser executado via `node scripts/register-efi-webhook.ts`)
// const WEBHOOK_URL = 'https://SEU_DOMINIO.com.br/api/efi-pay/webhook'; // Substitua pelo seu domínio
// registerEfiWebhook(WEBHOOK_URL, EFI_PIX_KEY)
//   .then(() => console.log('Processo de registro de webhook concluído.'))
//   .catch((e) => console.error('Falha no processo de registro de webhook:', e));
