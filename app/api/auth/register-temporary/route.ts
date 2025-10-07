import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado. Por favor, faça login.' },
        { status: 409 }
      );
    }

    if (existingUser) {
      // User already exists in a temporary state, proceed
      return NextResponse.json({ 
        message: 'Usuário temporário já existe.',
        user: { id: existingUser.id, email: existingUser.email } 
      }, { status: 200 });
    }

    // Create a temporary password to allow sign-in
    const temporaryPassword = randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        password: hashedPassword, // Store the hashed password
        needsPasswordChange: true, // Flag to force password change
      },
    });

    return NextResponse.json({ 
      user: { id: newUser.id, email: newUser.email },
      tempAuth: temporaryPassword // Send temp password to frontend for sign-in
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro temporário:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno.' }, { status: 500 });
  }
}
