import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

async function verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  return await bcrypt.compare(inputPassword, storedPassword)
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        source: { label: 'Source', type: 'text' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email
        const password = credentials?.password
        const source = String(credentials?.source || '')

        if (!email || !password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          throw new Error('Email ou senha incorretos')
        }

        const isPasswordValid = await verifyPassword(password, user.password)
        if (!isPasswordValid) {
          throw new Error('Email ou senha incorretos')
        }

        if (!user.signupSource) {
          await prisma.user.update({
            where: { email },
            data: { signupSource: source },
          })
        }

        return {
          id: user.id,
          email: user.email,
          premium: user.premium,
          username: user.username,
          name: user.name,
          access: user.access,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      const source = String(credentials?.source || 'google')

      if (account?.provider === 'google' && user.email) {
        try {
          // Busca o usuário pelo e-mail
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!dbUser) {
            // Cria um novo usuário se não existir
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || profile?.name,
                signupSource: source,
                premium: false,
                emailVerified: new Date(),
              },
            })
          }

          // Verifica se a conta do Google já está vinculada
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          })

          if (!existingAccount) {
            // Cria um registro na tabela `accounts` para vincular a conta do Google ao usuário
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            })
          } else if (!dbUser.signupSource) {
            // Atualiza o signupSource se necessário
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { signupSource: source },
            })
          }

          return true
        } catch (error) {
          console.error('Erro no callback signIn do Google:', error)
          return false
        }
      }

      return true
    },
    async session({ session, token }) {
      if (token && token.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email as string },
        })

        if (user) {
          // Verifica se a assinatura premium expirou
          const now = new Date()
          if (user.expireDate && user.expireDate < now && user.premium) {
            await prisma.user.update({
              where: { id: user.id },
              data: { premium: false },
            })
          }

          session.user = {
            ...session.user,
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            premium: user.premium,
            expireDate: user.premium ? user.expireDate : null,
            access: user.access,
          }
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Persiste os dados do usuário no token
      if (user) {
        token.id = user.id
        token.username = user.username
        token.name = user.name
        token.premium = user.premium
        token.expireDate = user.expireDate || null
        token.email = user.email
        token.access = user.access
      }

      // Atualiza o token quando o usuário faz login
      if (account) {
        token.accessToken = account.access_token
      }

      return token
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecionamentos relativos e absolutos para o mesmo domínio
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    newUser: '/register', // Página para novos usuários (opcional)
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log de atividades ou outras ações pós-login
      console.log(`User ${user.email} signed in via ${account?.provider}`)
    },
    async signOut({ token, session }) {
      // Limpeza ou log ao deslogar
      console.log('User signed out')
    },
  },
  debug: process.env.NODE_ENV === 'development',
} 