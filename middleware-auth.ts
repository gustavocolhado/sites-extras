import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware de autenticação para rotas protegidas
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    // Rotas que precisam de autenticação
    '/dashboard/:path*',
    '/profile/:path*',
    '/upload/:path*',
  ],
}
