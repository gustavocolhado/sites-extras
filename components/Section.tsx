import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'dark' | 'transparent'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Section({ 
  children, 
  className = '', 
  background = 'white',
  padding = 'md'
}: SectionProps) {
  const backgroundClasses = {
    white: 'theme-card',
    dark: 'bg-dark-card',
    transparent: 'bg-transparent'
  }

  const paddingClasses = {
    sm: 'pt-4',
    md: 'pt-4 md:pt-6',
    lg: 'pt-4 md:pt-8',
    xl: 'pt-4 md:pt-12'
  }

  return (
    <section className={`container-full ${backgroundClasses[background]} px-2 ${paddingClasses[padding]} ${className}`}>
      <div className="container-content">
        {children}
      </div>
    </section>
  )
} 