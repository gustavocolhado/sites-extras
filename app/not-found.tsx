'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar imediatamente para a página inicial
    router.replace('/')
  }, [router])

  // Retornar null para não renderizar nada
  return null
}
