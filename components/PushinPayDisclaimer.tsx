'use client'

import { AlertCircle } from 'lucide-react'

interface PushinPayDisclaimerProps {
  className?: string
}

export default function PushinPayDisclaimer({ className = '' }: PushinPayDisclaimerProps) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-1">Aviso Importante:</p>
          <p>
            A PUSHIN PAY atua exclusivamente como processadora de pagamentos e não possui qualquer responsabilidade pela entrega, suporte, conteúdo, qualidade ou cumprimento das obrigações relacionadas aos produtos ou serviços oferecidos pelo vendedor.
          </p>
        </div>
      </div>
    </div>
  )
}
