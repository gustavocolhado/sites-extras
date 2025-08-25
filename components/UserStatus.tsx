'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Crown, User } from 'lucide-react'

export default function UserStatus() {
  const { session, isPremium } = useAuth()

  if (!session?.user) return null

  return (
    <div className="flex items-center space-x-2">
      {isPremium ? (
        <div className="flex items-center space-x-1 text-yellow-500">
          <Crown size={16} />
          <span className="text-sm font-medium">Premium</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-theme-secondary">
          <User size={16} />
          <span className="text-sm">Gratuito</span>
        </div>
      )}
    </div>
  )
} 