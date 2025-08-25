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
    sm: 'py-4',
    md: 'py-4 md:py-6',
    lg: 'py-6 md:py-8',
    xl: 'py-8 md:py-12'
  }

  return (
    <section className={`container-full ${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}>
      <div className="container-content">
        {children}
      </div>
    </section>
  )
} 