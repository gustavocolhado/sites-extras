import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      premium: boolean
      expireDate?: Date | null
      access: number
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string | null
    premium: boolean
    expireDate?: Date | null
    access: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username?: string | null
    name?: string | null
    premium: boolean
    expireDate?: Date | null
    email?: string | null
    accessToken?: string
    access: number
  }
} 