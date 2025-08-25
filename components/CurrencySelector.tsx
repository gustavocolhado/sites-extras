'use client'

import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'

interface CountryInfo {
  country: string
  currency: string
  symbol: string
  exchangeRate: number
  locale: string
}

interface CurrencySelectorProps {
  currentCountry: CountryInfo
  onCountryChange: (country: CountryInfo) => void
  loading?: boolean
}

const availableCountries: Record<string, CountryInfo> = {
  BR: {
    country: 'Brasil',
    currency: 'BRL',
    symbol: 'R$',
    exchangeRate: 1,
    locale: 'pt-BR'
  },
  US: {
    country: 'Estados Unidos',
    currency: 'USD',
    symbol: '$',
    exchangeRate: 0.21,
    locale: 'en-US'
  },
  EU: {
    country: 'Europa',
    currency: 'EUR',
    symbol: '€',
    exchangeRate: 0.19,
    locale: 'en-EU'
  }
}

export default function CurrencySelector({ 
  currentCountry, 
  onCountryChange, 
  loading = false 
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCountrySelect = (countryCode: string) => {
    const country = availableCountries[countryCode]
    if (country) {
      onCountryChange(country)
      setIsOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-theme-secondary text-sm">
        <div className="animate-pulse bg-theme-secondary/20 h-4 w-4 rounded"></div>
        <div className="animate-pulse bg-theme-secondary/20 h-4 w-16 rounded"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-theme-secondary text-sm hover:text-theme-primary transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentCountry.currency}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-theme-card border border-theme-border-primary rounded-lg shadow-lg z-50 min-w-48">
          <div className="p-2">
            {Object.entries(availableCountries).map(([code, country]) => (
              <button
                key={code}
                onClick={() => handleCountrySelect(code)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  currentCountry.currency === country.currency
                    ? 'bg-accent-red/10 text-accent-red'
                    : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{country.country}</span>
                  <span className="font-medium">{country.symbol}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 