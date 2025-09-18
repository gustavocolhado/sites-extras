import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Configuração da Brevo via API REST
const BREVO_API_BASE = 'https://api.brevo.com/v3'
const BREVO_API_KEY = process.env.BREVO_API_KEY!

// Configurações SMTP da Brevo
const BREVO_SMTP_CONFIG = {
  HOST: 'smtp-relay.brevo.com',
  PORT: 587,
  SECURE: false, // true para 465, false para outras portas
  TLS: true,
  USER: process.env.BREVO_SMTP_USER || '9742b9001@smtp-brevo.com',
  PASS: process.env.BREVO_SMTP_PASS || '0jZORnJHwrk9sCaG',
}

// Configurações da Brevo
const BREVO_CONFIG = {
  // Rate limiting para evitar custos excessivos
  MAX_EMAILS_PER_BATCH: 50, // Brevo permite até 50 emails por batch
  DELAY_BETWEEN_BATCHES: 1000, // 1 segundo entre batches
  MAX_EMAILS_PER_SECOND: 14, // Limite recomendado
  
  // Configurações de email
  FROM_EMAIL: process.env.BREVO_FROM_EMAIL || 'noreply@cornosbrasil.com',
  FROM_NAME: process.env.BREVO_FROM_NAME || 'Cornos Brasil',
  
  // Configurações de template
  TEMPLATE_NAME: 'premium-promotion-template',
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
 * Cria transporter SMTP da Brevo
 */
function createBrevoTransporter() {
  return nodemailer.createTransport({
    host: BREVO_SMTP_CONFIG.HOST,
    port: BREVO_SMTP_CONFIG.PORT,
    secure: BREVO_SMTP_CONFIG.SECURE,
    auth: {
      user: BREVO_SMTP_CONFIG.USER,
      pass: BREVO_SMTP_CONFIG.PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Configurações específicas para campanhas
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: BREVO_CONFIG.MAX_EMAILS_PER_SECOND,
  })
}

/**
 * Envia um email simples usando SMTP da Brevo
 */
export async function sendSingleEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string,
  recipientName?: string,
  campaignId?: string
): Promise<boolean> {
  try {
    const transporter = createBrevoTransporter()
    
    const mailOptions = {
      from: `${BREVO_CONFIG.FROM_NAME} <${BREVO_CONFIG.FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: htmlBody,
      text: textBody,
      headers: {
        'X-Mailer': 'Cornos Brasil Marketing System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        // Headers para melhorar deliverability
        'List-Unsubscribe': `<${process.env.NEXTAUTH_URL}/unsubscribe?email=${to}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Campaign-ID': campaignId || 'default-campaign',
        'X-Sender-ID': 'cornos-brasil-marketing',
        'Return-Path': BREVO_CONFIG.FROM_EMAIL,
        'Reply-To': 'suporte@cornosbrasil.com',
        'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@cornosbrasil.com>`,
      },
      // Configurações para evitar spam
      envelope: {
        from: BREVO_CONFIG.FROM_EMAIL,
        to: to
      },
      // DKIM e SPF são gerenciados pela Brevo
      dkim: {
        domainName: 'cornosbrasil.com',
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY || ''
      }
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ Email Brevo SMTP enviado: ${result.messageId}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email Brevo SMTP:', error)
    return false
  }
}

/**
 * Envia um email simples usando API da Brevo (fallback)
 */
export async function sendSingleEmailAPI(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string,
  recipientName?: string
): Promise<boolean> {
  try {
    const emailData = {
      sender: {
        name: BREVO_CONFIG.FROM_NAME,
        email: BREVO_CONFIG.FROM_EMAIL
      },
      to: [{
        email: to,
        name: recipientName || to.split('@')[0]
      }],
      subject: subject,
      htmlContent: htmlBody,
      textContent: textBody,
      headers: {
        'X-Mailer': 'Cornos Brasil Marketing System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
      },
      tags: ['campaign', 'premium', 'marketing']
    }

    const response = await fetch(`${BREVO_API_BASE}/smtp/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Email Brevo API enviado: ${result.messageId}`)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Erro ao enviar email Brevo API:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email Brevo API:', error)
    return false
  }
}

/**
 * Envia emails em lote usando SMTP da Brevo (método principal)
 */
export async function sendBulkEmails(
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
  for (let i = 0; i < recipients.length; i += BREVO_CONFIG.MAX_EMAILS_PER_BATCH) {
    batches.push(recipients.slice(i, i + BREVO_CONFIG.MAX_EMAILS_PER_BATCH))
  }

  console.log(`📧 Enviando ${recipients.length} emails via Brevo SMTP em ${batches.length} batches`)

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    console.log(`📦 Processando batch ${i + 1}/${batches.length} (${batch.length} emails)`)

    // Processar batch em paralelo (limitado para evitar rate limiting)
    const batchPromises = batch.map(async (recipient) => {
      try {
        const htmlBody = personalizeTemplate(template.htmlBody, recipient)
        const textBody = personalizeTemplate(template.textBody, recipient)
        
        // Tentar SMTP primeiro, depois API como fallback
        let success = await sendSingleEmail(
          recipient.email,
          template.subject,
          htmlBody,
          textBody,
          recipient.name,
          campaignId
        )

        // Se SMTP falhar, tentar API
        if (!success) {
          console.log(`⚠️ SMTP falhou para ${recipient.email}, tentando API...`)
          success = await sendSingleEmailAPI(
            recipient.email,
            template.subject,
            htmlBody,
            textBody,
            recipient.name
          )
        }

        if (success) {
          results.sent++
          console.log(`✅ Email Brevo enviado para: ${recipient.email}`)
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
      console.log(`⏳ Aguardando ${BREVO_CONFIG.DELAY_BETWEEN_BATCHES}ms antes do próximo batch...`)
      await new Promise(resolve => setTimeout(resolve, BREVO_CONFIG.DELAY_BETWEEN_BATCHES))
    }
  }

  console.log(`📊 Resultado final Brevo: ${results.sent} enviados, ${results.failed} falharam`)
  return results
}

/**
 * Personaliza template com dados do usuário e elementos anti-spam
 */
function personalizeTemplate(template: string, recipient: EmailRecipient): string {
  const currentDate = new Date().toLocaleDateString('pt-BR')
  const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?email=${recipient.email}`
  
  return template
    .replace(/\{\{name\}\}/g, recipient.name || 'Usuário')
    .replace(/\{\{email\}\}/g, recipient.email)
    .replace(/\{\{userId\}\}/g, recipient.userId)
    .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl)
    .replace(/\{\{premiumUrl\}\}/g, 
      recipient.premiumTrackingUrl || 'https://cornosbrasil.com/premium'
    )
    .replace(/\{\{date\}\}/g, currentDate)
    // Adicionar footer anti-spam se não existir
    + `
    <div style="display:none; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
      Este email foi enviado para ${recipient.email} em ${currentDate}. 
      Para não receber mais emails: <a href="${unsubscribeUrl}">Clique aqui</a>
    </div>
    `
}

/**
 * Cria um contato na Brevo
 */
export async function createContact(
  email: string,
  name: string,
  attributes?: Record<string, any>
): Promise<boolean> {
  try {
    const contactData = {
      email: email,
      attributes: {
        FIRSTNAME: name,
        ...attributes
      },
      listIds: [parseInt(process.env.BREVO_LIST_ID || '1')]
    }

    const response = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(contactData)
    })

    if (response.ok) {
      console.log(`✅ Contato criado na Brevo: ${email}`)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Erro ao criar contato na Brevo:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao criar contato na Brevo:', error)
    return false
  }
}

/**
 * Atualiza um contato na Brevo
 */
export async function updateContact(
  email: string,
  attributes: Record<string, any>
): Promise<boolean> {
  try {
    const contactData = {
      attributes: attributes
    }

    const response = await fetch(`${BREVO_API_BASE}/contacts/${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(contactData)
    })

    if (response.ok) {
      console.log(`✅ Contato atualizado na Brevo: ${email}`)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Erro ao atualizar contato na Brevo:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar contato na Brevo:', error)
    return false
  }
}

/**
 * Remove um contato da Brevo
 */
export async function deleteContact(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${BREVO_API_BASE}/contacts/${email}`, {
      method: 'DELETE',
      headers: {
        'api-key': BREVO_API_KEY
      }
    })

    if (response.ok) {
      console.log(`✅ Contato removido da Brevo: ${email}`)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Erro ao remover contato da Brevo:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao remover contato da Brevo:', error)
    return false
  }
}

/**
 * Sincroniza usuários com a Brevo
 */
export async function syncUsersWithBrevo(users: any[]): Promise<{ synced: number; failed: number }> {
  const results = {
    synced: 0,
    failed: 0
  }

  console.log(`🔄 Sincronizando ${users.length} usuários com a Brevo`)

  for (const user of users) {
    try {
      const attributes = {
        FIRSTNAME: user.name || user.email.split('@')[0],
        PREMIUM: user.premium ? 'Yes' : 'No',
        ACCEPT_PROMOTIONAL: user.acceptPromotionalEmails ? 'Yes' : 'No',
        LAST_EMAIL_SENT: user.lastEmailSent ? user.lastEmailSent.toISOString() : null,
        USER_ID: user.id,
        CREATED_AT: user.createdAt ? user.createdAt.toISOString() : null,
      }

      const success = await createContact(user.email, user.name || user.email.split('@')[0], attributes)
      
      if (success) {
        results.synced++
      } else {
        results.failed++
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar usuário ${user.email}:`, error)
      results.failed++
    }
  }

  console.log(`📊 Sincronização concluída: ${results.synced} sincronizados, ${results.failed} falharam`)
  return results
}

/**
 * Obtém estatísticas de campanhas da Brevo
 */
export async function getCampaignStats(): Promise<any> {
  try {
    // Implementar busca de estatísticas de campanhas
    // A Brevo tem APIs específicas para isso
    return {
      totalCampaigns: 0,
      totalEmailsSent: 0,
      successRate: 0
    }
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas da Brevo:', error)
    return null
  }
}

/**
 * Valida se o email pode ser enviado (não está em lista de bloqueio)
 */
export async function canSendEmail(email: string): Promise<boolean> {
  try {
    // Verificar formato básico do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log(`❌ Email inválido: ${email}`)
      return false
    }

    // Verificar se não é um email temporário/descartável
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org'
    ]
    
    const domain = email.split('@')[1]?.toLowerCase()
    if (disposableDomains.includes(domain)) {
      console.log(`❌ Email descartável detectado: ${email}`)
      return false
    }

    // Verificar se o usuário não está em lista de bloqueio
    const blockedUser = await prisma.user.findFirst({
      where: {
        email: email,
        acceptPromotionalEmails: false
      }
    })

    if (blockedUser) {
      console.log(`❌ Usuário bloqueou emails promocionais: ${email}`)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Erro ao validar email:', error)
    return false
  }
}

/**
 * Valida e limpa lista de emails antes do envio
 */
export async function validateEmailList(emails: string[]): Promise<string[]> {
  const validEmails: string[] = []
  
  for (const email of emails) {
    if (await canSendEmail(email)) {
      validEmails.push(email)
    }
  }
  
  console.log(`📧 Lista validada: ${validEmails.length}/${emails.length} emails válidos`)
  return validEmails
}

export { BREVO_CONFIG }
