import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configuração do transporter de email
const createTransporter = () => {
  // Se tiver configuração SMTP personalizada completa
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Usando configuração SMTP personalizada para contato')
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  }
  
  // Configuração padrão Gmail
  console.log('Usando configuração Gmail para contato')
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validações
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nome, email e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar tamanho da mensagem
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'A mensagem deve ter pelo menos 10 caracteres' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'A mensagem deve ter no máximo 2000 caracteres' },
        { status: 400 }
      )
    }

    const transporter = createTransporter()
    const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER

    // Email para o administrador
    const adminEmail = {
      from: fromEmail,
      to: fromEmail, // Envia para o email configurado
      subject: `Nova mensagem de contato: ${subject || 'Sem assunto'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nova Mensagem de Contato</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Detalhes do Contato</h2>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Nome:</strong>
              <p style="color: #666; margin: 5px 0;">${name}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Email:</strong>
              <p style="color: #666; margin: 5px 0;">${email}</p>
            </div>
            
            ${subject ? `
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Assunto:</strong>
              <p style="color: #666; margin: 5px 0;">${subject}</p>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #333;">Mensagem:</strong>
              <div style="color: #666; margin: 5px 0; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-left: 4px solid #2196f3;">
              <p style="color: #333; margin: 0; font-size: 14px;">
                <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}<br>
                <strong>IP:</strong> ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A'}
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 CORNOS BRASIL. Mensagem enviada via formulário de contato.
            </p>
          </div>
        </div>
      `,
    }

    // Email de confirmação para o usuário
    const userEmail = {
      from: fromEmail,
      to: email,
      subject: 'Recebemos sua mensagem - CORNOS BRASIL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">CORNOS BRASIL</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Mensagem Recebida!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Olá <strong>${name}</strong>,
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Recebemos sua mensagem e agradecemos por entrar em contato conosco. 
              Nossa equipe irá analisar sua solicitação e responderemos o mais breve possível.
            </p>
            
            <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0;">Resumo da sua mensagem:</h3>
              <p style="color: #666; margin: 0; font-style: italic;">${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>Tempo de resposta esperado:</strong><br>
              • Suporte via Telegram: até 5 minutos<br>
              • Email: até 24 horas
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://t.me/cornosbrasil" 
                 style="background: #0088cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Falar no Telegram
              </a>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 CORNOS BRASIL. Esta é uma confirmação automática.
            </p>
          </div>
        </div>
      `,
    }

    // Enviar emails
    await transporter.sendMail(adminEmail)
    await transporter.sendMail(userEmail)

    // Log da mensagem (opcional)
    console.log(`Nova mensagem de contato de ${name} (${email}): ${subject || 'Sem assunto'}`)

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao processar mensagem de contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
} 