'use client'

import { useDomainContext } from '@/contexts/DomainContext'

export default function DomainDebug() {
  const { domainConfig, currentDomain, isLoading } = useDomainContext()

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-black p-2 rounded text-xs z-50">
        Carregando domínio...
      </div>
    )
  }

  if (!domainConfig) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded text-xs z-50">
        Erro: Configuração de domínio não encontrada
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded text-xs z-50 max-w-xs">
      <div className="font-bold mb-1">Domínio Atual:</div>
      <div className="mb-2">{currentDomain}</div>
      
      <div className="font-bold mb-1">Site:</div>
      <div className="mb-2">{domainConfig.siteName}</div>
      
      <div className="font-bold mb-1">Título:</div>
      <div className="mb-2 text-xs">{domainConfig.title}</div>
      
      <div className="font-bold mb-1">Cor Primária:</div>
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-4 h-4 rounded border border-white"
          style={{ backgroundColor: domainConfig.primaryColor }}
        />
        <span>{domainConfig.primaryColor}</span>
      </div>
      
      <div className="font-bold mb-1">Canonical:</div>
      <div className="text-xs break-all">{domainConfig.canonical}</div>
    </div>
  )
}
