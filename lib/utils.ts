import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza um email convertendo para minúsculas e removendo espaços
 * @param email - O email a ser normalizado
 * @returns O email normalizado em minúsculas
 */
export function normalizeEmail(email: string): string {
  if (!email) return email
  return email.trim().toLowerCase()
}

/**
 * Converte valor de reais (BRL) para dólares (USD)
 * @param reais - Valor em reais
 * @param exchangeRate - Taxa de câmbio BRL para USD (padrão: 5.50)
 * @returns Valor convertido para dólares
 */
export function convertReaisToDollars(reais: number, exchangeRate: number = 5.50): number {
  return Number((reais / exchangeRate).toFixed(2))
}

/**
 * Obtém a taxa de câmbio atual BRL para USD (valor fixo por enquanto)
 * Em produção, você pode integrar com uma API de câmbio como Fixer.io ou CurrencyAPI
 * @returns Taxa de câmbio atual
 */
export function getExchangeRate(): number {
  
  return 5.50
}