import type { Frame } from '../data/types'

// Ordena los modelos por coincidencia de color, afinidad orientativa con la
// forma del rostro y estilo. "ideales" son los del tipo buscado (recetadas o
// sol); "otras" completa con el resto del catálogo para dar más opciones.
export function recomendar(
  frames: Frame[],
  tipo: string | null,
  colores: string[],
  rostro: string | null = null,
  estilo: string | null = null,
): { ideales: Frame[]; otras: Frame[] } {
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

  const puntuacion = (frame: Frame) =>
    coincidencias(frame) * 3 +
    (rostro && afinidadRostro[rostro]?.includes(frame.id) ? 2 : 0) +
    (generoPreferido && frame.genero === generoPreferido ? 1 : 0)

  const ordenadas = [...frames].sort((a, b) => puntuacion(b) - puntuacion(a))
  const ideales = ordenadas.filter((frame) => frame.category === categoria).slice(0, 6)
  const otras = ordenadas.filter((frame) => !ideales.includes(frame)).slice(0, 3)
  return { ideales, otras }
}
