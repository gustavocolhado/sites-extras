import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { newPassword } = await req.json()

  if (!newPassword) {
    return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedNewPassword },
    })

    return NextResponse.json({ message: 'Senha alterada com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
