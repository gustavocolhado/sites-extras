'use client'

import { useState } from 'react'
import Link from 'next/link'

interface AdIconProps {
  className?: string
}

const AdIcon = ({ className = '' }: AdIconProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {/* Ícone "Ad" no canto superior direito */}
      <div
        className="absolute top-2 right-2 z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link 
          href="https://cbrservicosdigitais.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          {/* Ícone "Ad" simples */}
          {!isHovered && (
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md hover:bg-orange-600 transition-colors duration-200">
              Ad
            </div>
          )}
          
          {/* Texto completo ao passar o mouse */}
          {isHovered && (
            <div className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-md shadow-lg transition-all duration-200 whitespace-nowrap">
              Ad By CBR Digital Services
            </div>
          )}
        </Link>
      </div>
    </div>
  )
}

export default AdIcon 