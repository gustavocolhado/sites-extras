'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void
  loading: boolean
  hasMore: boolean
  children: React.ReactNode
}

export default function InfiniteScrollTrigger({
  onLoadMore,
  loading,
  hasMore,
  children
}: InfiniteScrollTriggerProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore()
      }
    },
    [hasMore, loading, onLoadMore]
  )

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: '100px' // Carrega quando está a 100px do final
    })

    if (triggerRef.current) {
      observerRef.current.observe(triggerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  return (
    <div>
      {children}
      
      {/* Trigger para infinite scroll */}
      {hasMore && (
        <div ref={triggerRef} className="flex justify-center items-center py-8">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-theme-primary" />
              <span className="text-theme-secondary text-sm">Carregando mais criadores...</span>
            </div>
          ) : (
            <div className="h-4" /> // Espaçador invisível
          )}
        </div>
      )}
      
      {/* Mensagem quando não há mais conteúdo */}
      {!hasMore && (
        <div className="text-center py-8">
          <p className="text-theme-secondary text-sm">
            Você chegou ao final da lista de criadores
          </p>
        </div>
      )}
    </div>
  )
} 