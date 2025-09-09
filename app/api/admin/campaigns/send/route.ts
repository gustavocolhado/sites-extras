import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBulkEmails, EmailTemplate, EmailRecipient } from '@/lib/ses'
import crypto from 'crypto'

// Função para gerar token de unsubscribe único
function generateUnsubscribeToken(userId: string): string {
  return crypto.createHash('sha256')
    .update(`${userId}-${Date.now()}-${Math.random()}`)
    .digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { 
      subject, 
      htmlBody, 
      textBody, 
      targetAudience = 'non-premium', // 'non-premium', 'all', 'premium'
      limit = 1000, // Limite para evitar custos excessivos
      sendType = 'campaign', // 'campaign' ou 'specific-user'
      specificUserEmail = '', // Email do usuário específico
      specificUser = null // Dados do usuário específico
    } = await request.json()

    // Validação básica
    if (!subject || !htmlBody || !textBody) {
      return NextResponse.json(
        { error: 'Assunto, HTML e texto são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação para usuário específico
    if (sendType === 'specific-user') {
      if (!specificUserEmail || !specificUser) {
        return NextResponse.json(
          { error: 'Email e dados do usuário são obrigatórios para envio específico' },
          { status: 400 }
        )
      }
    }

    // Calcular data limite (15 dias atrás)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    let users: any[] = []

    if (sendType === 'specific-user') {
      // Para usuário específico, usar os dados fornecidos
      users = [{
        id: specificUser.id,
        email: specificUser.email,
        name: specificUser.name,
        premium: specificUser.premium,
        acceptPromotionalEmails: specificUser.acceptPromotionalEmails,
        lastEmailSent: specificUser.lastEmailSent
      }]
    } else {
      // Buscar usuários baseado no público-alvo (campanha em massa)
      let whereClause: any = {
        acceptPromotionalEmails: true, // Apenas usuários que aceitam emails promocionais
        lastEmailSent: undefined // Usuários que nunca receberam email (campo não existe)
      }

      if (targetAudience === 'non-premium') {
        whereClause.premium = false
      } else if (targetAudience === 'premium') {
        whereClause.premium = true
      }
      // Se 'all', não adiciona filtro de premium

      users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          premium: true,
          acceptPromotionalEmails: true,
        },
        take: limit, // Limitar para evitar custos excessivos
      })
    }

    if (users.length === 0) {
      const errorMessage = sendType === 'specific-user' 
        ? 'Usuário não encontrado ou não aceita emails promocionais'
        : 'Nenhum usuário encontrado para o público-alvo especificado'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    console.log(`📊 ${sendType === 'specific-user' ? 'Enviando para usuário específico:' : `Encontrados ${users.length} usuários para campanha`}`)
    if (sendType === 'specific-user') {
      console.log(`   👤 ${users[0].name || 'Sem nome'} (${users[0].email})`)
    }

    // Preparar template
    const template: EmailTemplate = {
      subject,
      htmlBody,
      textBody,
    }

    // Criar campanha no banco
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: `Campanha ${new Date().toLocaleDateString('pt-BR')}`,
        subject,
        htmlBody,
        textBody,
        targetAudience,
        status: 'active',
        totalRecipients: users.length,
        sentAt: new Date(),
      }
    })

    // Preparar destinatários com links rastreáveis
    const recipients: EmailRecipient[] = await Promise.all(
      users.map(async (user) => {
        // Gerar link rastreável para premium
        const premiumTrackingId = crypto.randomBytes(16).toString('hex')
        const premiumTrackingUrl = `${process.env.NEXTAUTH_URL}/track/${premiumTrackingId}`

        // Criar link rastreável no banco
        await prisma.emailCampaignLink.create({
          data: {
            campaignId: campaign.id,
            userId: user.id,
            linkType: 'premium',
            originalUrl: `${process.env.NEXTAUTH_URL}/campaign-premium?campaign=${campaign.id}&email=${encodeURIComponent(user.email!)}`,
            trackingId: premiumTrackingId,
          }
        })

        // Gerar link rastreável para unsubscribe
        const unsubscribeTrackingId = crypto.randomBytes(16).toString('hex')
        const unsubscribeTrackingUrl = `${process.env.NEXTAUTH_URL}/track/${unsubscribeTrackingId}`

        // Criar link de unsubscribe no banco
        await prisma.emailCampaignLink.create({
          data: {
            campaignId: campaign.id,
            userId: user.id,
            linkType: 'unsubscribe',
            originalUrl: `${process.env.NEXTAUTH_URL}/unsubscribe?email=${user.email}`,
            trackingId: unsubscribeTrackingId,
          }
        })

        return {
          email: user.email!,
          name: user.name || user.email!.split('@')[0],
          userId: user.id,
          unsubscribeToken: generateUnsubscribeToken(user.id),
          premiumTrackingUrl,
        }
      })
    )

    // Enviar emails
    const results = await sendBulkEmails(recipients, template, `campaign-${Date.now()}`)

    // Atualizar data do último envio para usuários que receberam email com sucesso
    if (results.sent > 0) {
      const currentDate = new Date()
      const userIds = users.map(user => user.id)
      
      await prisma.user.updateMany({
        where: {
          id: {
            in: userIds
          }
        },
        data: {
          lastEmailSent: currentDate
        }
      })
      
      console.log(`📅 Atualizada data do último envio para ${results.sent} usuários`)
    }

    // Salvar log da campanha
    await prisma.campaignLog.create({
      data: {
        subject,
        targetAudience,
        totalRecipients: users.length,
        emailsSent: results.sent,
        emailsFailed: results.failed,
        errors: results.errors.join('; '),
        sentAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      message: `Campanha enviada com sucesso!`,
      stats: {
        totalRecipients: users.length,
        emailsSent: results.sent,
        emailsFailed: results.failed,
        successRate: `${((results.sent / users.length) * 100).toFixed(2)}%`,
      },
      errors: results.errors.slice(0, 10), // Apenas os primeiros 10 erros
    })

  } catch (error) {
    console.error('Erro ao enviar campanha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET - Listar campanhas enviadas
 */
export async function GET() {
  try {
    const campaigns = await prisma.campaignLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50, // Últimas 50 campanhas
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
