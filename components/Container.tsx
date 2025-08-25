import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export default function Container({ children, className = '', fullWidth = false }: ContainerProps) {
  if (fullWidth) {
    return (
      <div className={`w-full ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`max-w-content mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 ${className}`}>
      {children}
    </div>
  )
} 