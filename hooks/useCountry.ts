import { useState, useEffect } from 'react'

interface CountryInfo {
  country: string
  currency: string
  symbol: string
  exchangeRate: number
  locale: string
}

const countryData: Record<string, CountryInfo> = {
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
    exchangeRate: 0.21, // 1 BRL = 0.21 USD (aproximado)
    locale: 'en-US'
  },
  EU: {
    country: 'Europa',
    currency: 'EUR',
    symbol: '€',
    exchangeRate: 0.19, // 1 BRL = 0.19 EUR (aproximado)
    locale: 'en-EU'
  }
}

// Países que usam USD
const usdCountries = ['US', 'CA', 'AU', 'NZ', 'SG', 'HK', 'JP', 'KR', 'MX', 'AR', 'CL', 'CO', 'PE']

// Países da Europa que usam EUR
const europeanCountries = [
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 
  'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES'
]

export function useCountry() {
  const [countryInfo, setCountryInfo] = useState<CountryInfo>(countryData.BR)
  const [loading, setLoading] = useState(true)

  const changeCountry = (newCountry: CountryInfo) => {
    setCountryInfo(newCountry)
  }

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Usa a API ipapi.co (gratuita e confiável)
        const response = await fetch('https://ipapi.co/json/')
        
        if (response.ok) {
          const data = await response.json()
          const countryCode = data.country_code

          // Verifica se é um país europeu
          if (europeanCountries.includes(countryCode)) {
            setCountryInfo(countryData.EU)
          } else if (usdCountries.includes(countryCode)) {
            setCountryInfo(countryData.US)
          } else if (countryCode === 'BR') {
            setCountryInfo(countryData.BR)
          } else {
            // Fallback para Brasil se o país não estiver na lista
            setCountryInfo(countryData.BR)
          }
        } else {
          // Fallback se a API falhar
          setCountryInfo(countryData.BR)
        }
      } catch (error) {
        console.log('Erro ao detectar país, usando Brasil como padrão:', error)
        // Fallback para Brasil em caso de erro
        setCountryInfo(countryData.BR)
      } finally {
        setLoading(false)
      }
    }

    detectCountry()
  }, [])

  const formatPrice = (priceInBRL: number): string => {
    const convertedPrice = priceInBRL * countryInfo.exchangeRate
    
    // Formata o preço baseado na moeda
    switch (countryInfo.currency) {
      case 'BRL':
        return `${countryInfo.symbol} ${convertedPrice.toFixed(2).replace('.', ',')}`
      case 'USD':
      case 'EUR':
        return `${countryInfo.symbol} ${convertedPrice.toFixed(2)}`
      default:
        return `${countryInfo.symbol} ${convertedPrice.toFixed(2)}`
    }
  }

  const getOriginalPrice = (priceInBRL: number): number => {
    return priceInBRL * countryInfo.exchangeRate
  }

  return {
    countryInfo,
    loading,
    formatPrice,
    getOriginalPrice,
    changeCountry
  }
} 