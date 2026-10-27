import type { Frame } from '../data/types'

// Ordena los modelos disponibles por coincidencia de color, afinidad orientativa
// con la forma del rostro y categoría de montura elegida.
export function recomendar(
  frames: Frame[],
  tipo: string | null,
  colores: string[],
  rostro: string | null = null,
  estilo: string | null = null,
): Frame[] {
  const categoria = tipo === 'sol' ? 'sol' : 'formula'
  const coincidencias = (frame: Frame) =>
    frame.colors.filter((c) => colores.includes(c.id)).length

  // Afinidad orientativa según la silueta visible de los modelos del catálogo.
  const afinidadRostro: Record<string, string[]> = {
    redondo: ['diseno-1', 'diseno-3'],
    rectangular: ['diseno-2', 'diseno-4'],
    diamante: ['diseno-2', 'diseno-4'],
    ovalado: ['diseno-1', 'diseno-2', 'diseno-3', 'diseno-4'],
    corazon: ['diseno-2', 'diseno-4'],
    triangular: ['diseno-1', 'diseno-3'],
  }
  const generoPreferido = estilo === 'mujer' || estilo === 'hombre' ? estilo : null

  return frames
    .filter((frame) => frame.category === categoria)
    .sort((a, b) => {
      const puntuacion = (frame: Frame) =>
        coincidencias(frame) * 3 +
        (rostro && afinidadRostro[rostro]?.includes(frame.id) ? 2 : 0) +
        (generoPreferido && frame.genero === generoPreferido ? 1 : 0)
      return puntuacion(b) - puntuacion(a)
    })
    .slice(0, 6)
}
