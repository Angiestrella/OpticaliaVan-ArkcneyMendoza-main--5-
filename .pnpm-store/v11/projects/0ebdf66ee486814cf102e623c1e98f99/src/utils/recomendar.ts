import type { Frame } from '../data/types'

// Recomendación a partir del test. Hoy solo cruza "¿qué buscas?" (recetadas o
// sol) y los colores elegidos: las monturas no tienen todavía datos de forma
// de rostro ni de estilo, así que esas dos respuestas aún no influyen.
export function recomendar(
  frames: Frame[],
  tipo: string | null,
  colores: string[],
): Frame[] {
  const categoria = tipo === 'sol' ? 'sol' : 'formula'
  const coincidencias = (frame: Frame) =>
    frame.colors.filter((c) => colores.includes(c.id)).length

  return frames
    .filter((frame) => frame.category === categoria)
    .sort((a, b) => coincidencias(b) - coincidencias(a))
    .slice(0, 6)
}
