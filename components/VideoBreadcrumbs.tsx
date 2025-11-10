'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface VideoBreadcrumbsProps {
  title: string
  category: string[]
  videoUrl: string
}

export default function VideoBreadcrumbs({ title, category, videoUrl }: VideoBreadcrumbsProps) {
  const categorySlug = category[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'categoria'
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-theme-muted mb-4 mt-4 px-3" aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center hover:text-theme-primary transition-colors"
        title="Página inicial"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      <ChevronRight className="w-4 h-4" />
      
      <Link 
        href="/videos" 
        className="hover:text-theme-primary transition-colors"
        title="Todos os vídeos"
      >
        Vídeos
      </Link>
      
      {category[0] && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Link 
            href={`/categories/${categorySlug}`}
            className="hover:text-theme-primary transition-colors"
            title={`Categoria: ${category[0]}`}
          >
            {category[0]}
          </Link>
        </>
      )}
      
      <ChevronRight className="w-4 h-4" />
      
      <span className="text-theme-primary font-medium truncate max-w-xs" title={title}>
        {title}
      </span>
    </nav>
  )
}
