'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'

export default function ThemeDebug() {
  const { theme, toggleTheme } = useTheme()
  const [htmlClass, setHtmlClass] = useState('')
  const [localStorageTheme, setLocalStorageTheme] = useState('')

  useEffect(() => {
    // Verificar classe do HTML
    setHtmlClass(document.documentElement.className)
    
    // Verificar localStorage
    setLocalStorageTheme(localStorage.getItem('theme') || 'não encontrado')
    
    // Atualizar a cada mudança
    const interval = setInterval(() => {
      setHtmlClass(document.documentElement.className)
      setLocalStorageTheme(localStorage.getItem('theme') || 'não encontrado')
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-20 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">Debug do Tema</h3>
      <div className="space-y-1">
        <p>Context Theme: <span className="text-yellow-400">{theme}</span></p>
        <p>HTML Class: <span className="text-green-400">{htmlClass}</span></p>
        <p>LocalStorage: <span className="text-blue-400">{localStorageTheme}</span></p>
        <button 
          onClick={toggleTheme}
          className="mt-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  )
} 