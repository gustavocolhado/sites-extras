/**
 * Utilitários para gerenciar a verificação de idade
 */

/**
 * Verifica se o usuário já confirmou a idade
 */
export function hasConfirmedAge(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return localStorage.getItem('ageConfirmed') === 'true'
}

/**
 * Marca que o usuário confirmou a idade
 */
export function confirmAge(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem('ageConfirmed', 'true')
}

/**
 * Remove a confirmação de idade (útil para testes)
 */
export function resetAgeConfirmation(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem('ageConfirmed')
}

/**
 * Força o modal de verificação de idade a aparecer novamente
 */
export function forceAgeVerification(): void {
  resetAgeConfirmation()
  window.location.reload()
}
