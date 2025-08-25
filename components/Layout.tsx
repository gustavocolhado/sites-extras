import { ReactNode } from 'react'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
} 