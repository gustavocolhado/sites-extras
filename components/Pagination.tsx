'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
  showInfo?: boolean
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 12,
  onPageChange,
  showInfo = true,
  className = ''
}: PaginationProps) {
  // Calcular informações
  const safeTotalItems = typeof totalItems === 'number' ? totalItems : 0
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, safeTotalItems)
  
  // Gerar páginas para exibir
  const getVisiblePages = () => {
    const delta = 2 // Número de páginas antes e depois da atual
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  // Handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  // Se não há páginas, não renderizar
  if (totalPages <= 1 || !totalPages) {
    return null
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Informações */}
      {showInfo && safeTotalItems > 0 && (
        <div className="text-sm text-theme-secondary">
          Mostrando <span className="font-medium text-theme-primary">{startItem}</span> a{' '}
          <span className="font-medium text-theme-primary">{endItem}</span> de{' '}
          <span className="font-medium text-theme-primary">{safeTotalItems.toLocaleString()}</span> vídeos
        </div>
      )}

      {/* Controles de Paginação */}
      <div className="flex items-center gap-1">
        {/* Botão Anterior */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-theme-border bg-theme-card text-theme-secondary hover:bg-theme-hover hover:text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Páginas */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div
                  key={`dots-${index}`}
                  className="flex items-center justify-center w-10 h-10 text-theme-secondary"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
                  isActive
                    ? 'border-accent-red bg-accent-red text-white'
                    : 'border-theme-border bg-theme-card text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                }`}
                aria-label={`Página ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-theme-border bg-theme-card text-theme-secondary hover:bg-theme-hover hover:text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
} 