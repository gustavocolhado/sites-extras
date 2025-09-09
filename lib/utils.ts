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