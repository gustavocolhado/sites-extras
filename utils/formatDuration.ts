export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) {
    return '0:00'
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
} 