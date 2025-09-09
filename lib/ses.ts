import { SESClient, SendEmailCommand, SendBulkTemplatedEmailCommand } from '@aws-sdk/client-ses'
import nodemailer from 'nodemailer'

// Configuração do Amazon SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Configurações para otimização de custos
const SES_CONFIG = {
  // Rate limiting para evitar custos excessivos
  MAX_EMAILS_PER_BATCH: 50, // Amazon SES permite até 50 emails por batch
  DELAY_BETWEEN_BATCHES: 1000, // 1 segundo entre batches
  MAX_EMAILS_PER_SECOND: 14, // Limite recomendado para sandbox
  
  // Configurações de email
  FROM_EMAIL: process.env.SES_FROM_EMAIL || 'noreply@cornosbrasil.com',
  FROM_NAME: process.env.SES_FROM_NAME || 'Cornos Brasil',
  
  // Configurações de template
  TEMPLATE_NAME: 'premium-promotion-template',
}

// Configuração SMTP do Amazon SES
const SMTP_CONFIG = {
  // Configurações do SES
  HOST: 'email-smtp.us-east-2.amazonaws.com',
  PORT: 587, // Porta STARTTLS recomendada
  SECURE: false, // true para 465, false para outras portas
  TLS: true, // TLS obrigatório
  
  // Configurações de email
  FROM_EMAIL: process.env.SES_FROM_EMAIL || 'no-reply@cornosbrasil.com',
  FROM_NAME: process.env.SES_FROM_NAME || 'Cornos Brasil',
}

// Configuração SMTP EXCLUSIVA para Email Marketing
const EMAIL_MARKETING_SMTP_CONFIG = {
  // Configurações específicas do SES para marketing
  HOST: 'email-smtp.us-east-2.amazonaws.com',
  PORT: 587, // Porta STARTTLS recomendada
  SECURE: false, // true para 465, false para outras portas
  TLS: true, // TLS obrigatório
  
  // Configurações de email específicas para marketing
  FROM_EMAIL: process.env.EMAIL_MARKETING_FROM_EMAIL || 'marketing@cornosbrasil.com',
  FROM_NAME: process.env.EMAIL_MARKETING_FROM_NAME || 'Cornos Brasil Marketing',
  
  // Rate limiting específico para campanhas
  MAX_EMAILS_PER_BATCH: 50,
  DELAY_BETWEEN_BATCHES: 1000, // 1 segundo
  MAX_EMAILS_PER_SECOND: 14, // Limite SES sandbox
  
  // Configurações de pool específicas para marketing
  POOL_MAX_CONNECTIONS: 5,
  POOL_MAX_MESSAGES: 100,
  POOL_RATE_LIMIT: 14,
}

export interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

export interface EmailRecipient {
  email: string
  name: string
  userId: string
  unsubscribeToken?: string
  premiumTrackingUrl?: string
}

export interface CampaignData {
  template: EmailTemplate
  recipients: EmailRecipient[]
  campaignId: string
  subject: string
}

/**
 * Envia um email simples usando Amazon SES
 */
export async function sendSingleEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<boolean> {
  try {
    const command = new SendEmailCommand({
      Source: `${SES_CONFIG.FROM_NAME} <${SES_CONFIG.FROM_EMAIL}>`,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8',
          },
        },
      },
    })

    await sesClient.send(command)
    return true
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return false
  }
}

/**
 * Cria transporter SMTP do SES
 */
function createSMTPTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Credenciais SMTP não configuradas')
  }

  return nodemailer.createTransport({
    host: SMTP_CONFIG.HOST,
    port: SMTP_CONFIG.PORT,
    secure: SMTP_CONFIG.SECURE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
    },
    // Configurações específicas do SES
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: SES_CONFIG.MAX_EMAILS_PER_SECOND,
  })
}

/**
 * Envia um email simples usando SMTP SES
 */
async function sendSingleEmailSMTP(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<boolean> {
  try {
    const transporter = createSMTPTransporter()
    
    const mailOptions = {
      from: `${SMTP_CONFIG.FROM_NAME} <${SMTP_CONFIG.FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: htmlBody,
      text: textBody,
      // Configurações específicas do SES
      headers: {
        'X-SES-CONFIGURATION-SET': 'cornos-brasil-config',
        'X-SES-MESSAGE-TAGS': 'campaign,premium',
      },
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ Email SMTP enviado: ${result.messageId}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email SMTP:', error)
    return false
  }
}

/**
 * Envia emails em lote usando SMTP SES
 */
async function sendBulkEmailsSMTP(
  recipients: EmailRecipient[],
  template: EmailTemplate,
  campaignId: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Dividir em batches para otimizar custos
  const batches = []
  for (let i = 0; i < recipients.length; i += SES_CONFIG.MAX_EMAILS_PER_BATCH) {
    batches.push(recipients.slice(i, i + SES_CONFIG.MAX_EMAILS_PER_BATCH))
  }

  console.log(`📧 Enviando ${recipients.length} emails via SMTP em ${batches.length} batches`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`📦 Processando batch ${i + 1}/${batches.length} (${batch.length} emails)`)

    // Processar batch em paralelo (limitado para evitar rate limiting)
    const batchPromises = batch.map(async (recipient) => {
      try {
        const htmlBody = personalizeTemplate(template.htmlBody, recipient)
        const textBody = personalizeTemplate(template.textBody, recipient)
        
        const success = await sendSingleEmailSMTP(
          recipient.email,
          template.subject,
          htmlBody,
          textBody
        )

        if (success) {
          results.sent++
          console.log(`✅ Email SMTP enviado para: ${recipient.email}`)
        } else {
          results.failed++
          results.errors.push(`Falha ao enviar para: ${recipient.email}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Erro ao enviar para ${recipient.email}: ${error}`)
        console.error(`❌ Erro ao enviar para ${recipient.email}:`, error)
      }
    })

    // Aguardar batch atual
    await Promise.all(batchPromises)

    // Delay entre batches para evitar rate limiting
    if (i < batches.length - 1) {
      console.log(`⏳ Aguardando ${SES_CONFIG.DELAY_BETWEEN_BATCHES}ms antes do próximo batch...`)
      await new Promise(resolve => setTimeout(resolve, SES_CONFIG.DELAY_BETWEEN_BATCHES))
    }
  }

  console.log(`📊 Resultado final SMTP: ${results.sent} enviados, ${results.failed} falharam`)
  return results
}

/**
 * Cria transporter SMTP EXCLUSIVO para Email Marketing
 */
function createEmailMarketingTransporter() {
  if (!process.env.EMAIL_MARKETING_SMTP_USER || !process.env.EMAIL_MARKETING_SMTP_PASS) {
    throw new Error('Credenciais SMTP de Email Marketing não configuradas')
  }

  console.log('📧 Criando transporter SMTP exclusivo para Email Marketing')

  return nodemailer.createTransport({
    host: EMAIL_MARKETING_SMTP_CONFIG.HOST,
    port: EMAIL_MARKETING_SMTP_CONFIG.PORT,
    secure: EMAIL_MARKETING_SMTP_CONFIG.SECURE,
    auth: {
      user: process.env.EMAIL_MARKETING_SMTP_USER,
      pass: process.env.EMAIL_MARKETING_SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
    },
    // Configurações específicas para marketing
    pool: true,
    maxConnections: EMAIL_MARKETING_SMTP_CONFIG.POOL_MAX_CONNECTIONS,
    maxMessages: EMAIL_MARKETING_SMTP_CONFIG.POOL_MAX_MESSAGES,
    rateLimit: EMAIL_MARKETING_SMTP_CONFIG.POOL_RATE_LIMIT,
    // Configurações adicionais para campanhas
    connectionTimeout: 60000, // 60 segundos
    greetingTimeout: 30000,   // 30 segundos
    socketTimeout: 60000,     // 60 segundos
  })
}

/**
 * Envia um email de marketing usando SMTP exclusivo
 */
async function sendMarketingEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<boolean> {
  try {
    const transporter = createEmailMarketingTransporter()
    
    const mailOptions = {
      from: `${EMAIL_MARKETING_SMTP_CONFIG.FROM_NAME} <${EMAIL_MARKETING_SMTP_CONFIG.FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: htmlBody,
      text: textBody,
      // Headers específicos para marketing
      headers: {
        'X-SES-CONFIGURATION-SET': 'cornos-brasil-marketing',
        'X-SES-MESSAGE-TAGS': 'marketing,campaign,premium',
        'X-Mailer': 'Cornos Brasil Marketing System',
        'X-Priority': '3', // Normal priority
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
      },
      // Configurações específicas para campanhas
      list: {
        unsubscribe: `${process.env.NEXTAUTH_URL}/unsubscribe?email=${to}`,
      },
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ Email de marketing enviado: ${result.messageId}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email de marketing:', error)
    return false
  }
}

/**
 * Envia campanhas de marketing em lote
 */
async function sendMarketingCampaign(
  recipients: EmailRecipient[],
  template: EmailTemplate,
  campaignId: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Dividir em batches para otimizar custos
  const batches = []
  for (let i = 0; i < recipients.length; i += EMAIL_MARKETING_SMTP_CONFIG.MAX_EMAILS_PER_BATCH) {
    batches.push(recipients.slice(i, i + EMAIL_MARKETING_SMTP_CONFIG.MAX_EMAILS_PER_BATCH))
  }

  console.log(`📧 Enviando campanha de marketing: ${recipients.length} emails em ${batches.length} batches`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`📦 Processando batch de marketing ${i + 1}/${batches.length} (${batch.length} emails)`)

    // Processar batch em paralelo (limitado para evitar rate limiting)
    const batchPromises = batch.map(async (recipient) => {
      try {
        const htmlBody = personalizeTemplate(template.htmlBody, recipient)
        const textBody = personalizeTemplate(template.textBody, recipient)
        
        const success = await sendMarketingEmail(
          recipient.email,
          template.subject,
          htmlBody,
          textBody
        )

        if (success) {
          results.sent++
          console.log(`✅ Email de marketing enviado para: ${recipient.email}`)
        } else {
          results.failed++
          results.errors.push(`Falha ao enviar para: ${recipient.email}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Erro ao enviar para ${recipient.email}: ${error}`)
        console.error(`❌ Erro ao enviar para ${recipient.email}:`, error)
      }
    })

    // Aguardar batch atual
    await Promise.all(batchPromises)

    // Delay entre batches para evitar rate limiting
    if (i < batches.length - 1) {
      console.log(`⏳ Aguardando ${EMAIL_MARKETING_SMTP_CONFIG.DELAY_BETWEEN_BATCHES}ms antes do próximo batch...`)
      await new Promise(resolve => setTimeout(resolve, EMAIL_MARKETING_SMTP_CONFIG.DELAY_BETWEEN_BATCHES))
    }
  }

  console.log(`📊 Resultado da campanha de marketing: ${results.sent} enviados, ${results.failed} falharam`)
  return results
}

/**
 * Envia emails em lote para otimizar custos
 * Usa SMTP de marketing exclusivo primeiro, depois fallbacks
 */
export async function sendBulkEmails(
  recipients: EmailRecipient[],
  template: EmailTemplate,
  campaignId: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  // Tentar SMTP de marketing exclusivo primeiro (mais confiável)
  if (process.env.EMAIL_MARKETING_SMTP_USER && process.env.EMAIL_MARKETING_SMTP_PASS) {
    console.log('📧 Usando SMTP exclusivo de Email Marketing para campanhas')
    return await sendMarketingCampaign(recipients, template, campaignId)
  }

  // Fallback para SMTP geral
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Usando SMTP geral para envio de campanhas')
    return await sendBulkEmailsSMTP(recipients, template, campaignId)
  }

  // Fallback para SDK AWS
  console.log('📧 Usando SDK AWS para envio de campanhas')
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Dividir em batches para otimizar custos
  const batches = []
  for (let i = 0; i < recipients.length; i += SES_CONFIG.MAX_EMAILS_PER_BATCH) {
    batches.push(recipients.slice(i, i + SES_CONFIG.MAX_EMAILS_PER_BATCH))
  }

  console.log(`📧 Enviando ${recipients.length} emails em ${batches.length} batches`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`📦 Processando batch ${i + 1}/${batches.length} (${batch.length} emails)`)

    // Processar batch em paralelo (limitado para evitar rate limiting)
    const batchPromises = batch.map(async (recipient) => {
      try {
        const htmlBody = personalizeTemplate(template.htmlBody, recipient)
        const textBody = personalizeTemplate(template.textBody, recipient)
        
        const success = await sendSingleEmail(
          recipient.email,
          template.subject,
          htmlBody,
          textBody
        )

        if (success) {
          results.sent++
          console.log(`✅ Email enviado para: ${recipient.email}`)
        } else {
          results.failed++
          results.errors.push(`Falha ao enviar para: ${recipient.email}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Erro ao enviar para ${recipient.email}: ${error}`)
        console.error(`❌ Erro ao enviar para ${recipient.email}:`, error)
      }
    })

    // Aguardar batch atual
    await Promise.all(batchPromises)

    // Delay entre batches para evitar rate limiting
    if (i < batches.length - 1) {
      console.log(`⏳ Aguardando ${SES_CONFIG.DELAY_BETWEEN_BATCHES}ms antes do próximo batch...`)
      await new Promise(resolve => setTimeout(resolve, SES_CONFIG.DELAY_BETWEEN_BATCHES))
    }
  }

  console.log(`📊 Resultado final: ${results.sent} enviados, ${results.failed} falharam`)
  return results
}

/**
 * Personaliza template com dados do usuário
 */
function personalizeTemplate(template: string, recipient: EmailRecipient): string {
  return template
    .replace(/\{\{name\}\}/g, recipient.name || 'Usuário')
    .replace(/\{\{email\}\}/g, recipient.email)
    .replace(/\{\{userId\}\}/g, recipient.userId)
    .replace(/\{\{unsubscribeUrl\}\}/g, 
      `${process.env.NEXTAUTH_URL}/unsubscribe?email=${recipient.email}`
    )
    .replace(/\{\{premiumUrl\}\}/g, 
      recipient.premiumTrackingUrl || 'https://cornosbrasil.com/premium'
    )
}

/**
 * Gera token de unsubscribe único
 */
export function generateUnsubscribeToken(userId: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256')
    .update(`${userId}-${Date.now()}-${Math.random()}`)
    .digest('hex')
}

/**
 * Valida se o email pode ser enviado (não está em lista de bloqueio)
 */
export async function canSendEmail(email: string): Promise<boolean> {
  // Aqui você pode implementar verificações adicionais:
  // - Lista de emails bloqueados
  // - Verificação de bounce
  // - Rate limiting por usuário
  
  return true // Por enquanto, permite todos
}

export { sesClient, SES_CONFIG }
