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
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1280px] 2xl:max-w-[1536px] 3xl:max-w-[1800px] ${className}`}>
      {children}
    </div>
  )
}