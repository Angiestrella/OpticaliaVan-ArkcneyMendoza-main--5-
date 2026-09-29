// Fecha local en el formato que espera <input type="date"> (YYYY-MM-DD).
export function toInputDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// "2026-09-22" -> "lunes, 22 de septiembre de 2026"
export function formatLongDate(inputDate: string): string {
  return new Date(`${inputDate}T00:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
