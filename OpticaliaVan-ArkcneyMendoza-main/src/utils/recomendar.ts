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
  // Cada línea agrupa una marca: así es fácil ver dónde va una montura nueva.
  const afinidadRostro: Record<string, string[]> = {
    redondo: [
      'bahamas-blue-nassau', 'bahamas-blue-exuma', 'bahamas-blue-eleuthera',
      'the-look-prisma',
      'trendi-metro', 'trendi-dalia', 'trendi-contraste', 'trendi-jade', 'trendi-clip-solar',
      'valentin-roma', 'valentin-florencia', 'valentin-venecia',
      'dimilano-brera',
      'oakley-ridge', 'oakley-torque', 'oakley-frost',
      'pull-bear-soho', 'pull-bear-brooklyn', 'pull-bear-austin',
      'arturo-calle-cartagena', 'arturo-calle-medellin', 'arturo-calle-santa-marta', 'arturo-calle-bogota',
      'arturo-calle-manizales', 'arturo-calle-cali', 'arturo-calle-pereira', 'arturo-calle-popayan',
      'carolina-herrera-noir', 'carolina-herrera-mosaico', 'carolina-herrera-felina',
      'monastery-couture-champana', 'monastery-couture-celeste', 'monastery-oro',
      'oakley-sprint',
      'karl-lagerfeld-marine',
      'mario-hernandez-clasico', 'mario-hernandez-ejecutivo', 'mario-hernandez-monograma', 'mario-hernandez-esmeralda',
      'arturo-calle-villa-de-leyva',
      'oakley-azure',
      'karl-lagerfeld-rouge',
      'carolina-herrera-petite-gris', 'carolina-herrera-escarlata',
    ],
    rectangular: [
      'bahamas-blue-bimini', 'bahamas-blue-cristal',
      'the-look-bosque', 'the-look-vuelo', 'the-look-piloto', 'the-look-terra',
      'trendi-aviador',
      'valentin-siena',
      'carolina-herrera-riviera', 'carolina-herrera-amatista', 'carolina-herrera-joya',
      'pull-bear-malibu', 'pull-bear-lisboa', 'pull-bear-oslo',
      'mario-hernandez-bohemio', 'mario-hernandez-fiera',
      'oakley-orbit',
      'carolina-herrera-atardecer', 'carolina-herrera-rubi', 'carolina-herrera-miel',
    ],
    diamante: [
      'bahamas-blue-nassau', 'bahamas-blue-exuma', 'bahamas-blue-eleuthera', 'bahamas-blue-bimini', 'bahamas-blue-cristal',
      'the-look-bosque', 'the-look-terra',
      'valentin-aire', 'valentin-florencia', 'valentin-siena', 'valentin-venecia',
      'dimilano-brera',
      'carolina-herrera-riviera', 'carolina-herrera-amatista', 'carolina-herrera-noir', 'carolina-herrera-joya', 'carolina-herrera-felina', 'monastery-coral',
      'pull-bear-malibu', 'pull-bear-lisboa', 'pull-bear-oslo',
      'arturo-calle-cartagena', 'arturo-calle-santa-marta',
      'mario-hernandez-bohemio', 'mario-hernandez-esmeralda', 'mario-hernandez-fiera',
      'oakley-orbit',
      'carolina-herrera-petite-gris', 'carolina-herrera-petite-negra', 'carolina-herrera-rubi', 'carolina-herrera-miel',
    ],
    ovalado: [
      'bahamas-blue-nassau', 'bahamas-blue-exuma', 'bahamas-blue-eleuthera', 'bahamas-blue-bimini', 'bahamas-blue-cristal',
      'the-look-prisma', 'the-look-bosque', 'the-look-vuelo', 'the-look-piloto', 'the-look-terra',
      'trendi-metro', 'trendi-dalia', 'trendi-contraste', 'trendi-jade', 'trendi-aviador', 'trendi-clip-solar',
      'valentin-aire', 'valentin-roma', 'valentin-florencia', 'valentin-siena', 'valentin-venecia',
      'dimilano-brera',
      'oakley-ridge', 'oakley-torque', 'oakley-frost', 'oakley-sprint',
      'carolina-herrera-riviera', 'carolina-herrera-amatista', 'carolina-herrera-noir',
      'carolina-herrera-mosaico', 'carolina-herrera-joya', 'carolina-herrera-felina',
      'pull-bear-soho', 'pull-bear-brooklyn', 'pull-bear-malibu', 'pull-bear-austin', 'pull-bear-lisboa', 'pull-bear-oslo',
      'arturo-calle-cartagena', 'arturo-calle-medellin', 'arturo-calle-santa-marta', 'arturo-calle-bogota',
      'arturo-calle-manizales', 'arturo-calle-cali', 'arturo-calle-pereira', 'arturo-calle-popayan',
      'monastery-couture-champana', 'monastery-couture-celeste', 'monastery-oro', 'monastery-coral',
      'karl-lagerfeld-marine',
      'mario-hernandez-clasico', 'mario-hernandez-ejecutivo', 'mario-hernandez-monograma', 'mario-hernandez-bohemio', 'mario-hernandez-esmeralda', 'mario-hernandez-fiera',
      'oakley-orbit', 'oakley-azure',
      'arturo-calle-villa-de-leyva',
      'karl-lagerfeld-rouge',
      'carolina-herrera-petite-gris', 'carolina-herrera-petite-negra', 'carolina-herrera-escarlata', 'carolina-herrera-atardecer', 'carolina-herrera-rubi', 'carolina-herrera-miel',
    ],
    corazon: [
      'bahamas-blue-bimini', 'bahamas-blue-cristal',
      'the-look-prisma', 'the-look-vuelo', 'the-look-piloto',
      'trendi-metro', 'trendi-jade', 'trendi-aviador', 'trendi-clip-solar',
      'valentin-aire',
      'oakley-torque',
      'pull-bear-soho',
      'arturo-calle-bogota', 'arturo-calle-cali',
      'carolina-herrera-amatista',
      'monastery-couture-champana', 'monastery-coral',
      'mario-hernandez-bohemio',
      'oakley-orbit', 'oakley-azure',
      'carolina-herrera-petite-negra', 'carolina-herrera-miel',
    ],
    triangular: [
      'bahamas-blue-nassau', 'bahamas-blue-exuma', 'bahamas-blue-eleuthera',
      'trendi-dalia', 'trendi-contraste',
      'valentin-florencia', 'valentin-venecia',
      'dimilano-brera',
      'arturo-calle-cartagena', 'arturo-calle-santa-marta', 'arturo-calle-bogota',
      'carolina-herrera-noir', 'carolina-herrera-mosaico', 'carolina-herrera-joya', 'carolina-herrera-felina', 'monastery-coral',
      'mario-hernandez-esmeralda', 'mario-hernandez-fiera',
      'karl-lagerfeld-rouge',
      'carolina-herrera-petite-gris', 'carolina-herrera-escarlata', 'carolina-herrera-atardecer', 'carolina-herrera-rubi',
    ],
  }
  const generoPreferido = estilo === 'mujer' || estilo === 'hombre' ? estilo : null

  const puntuacion = (frame: Frame) =>
    coincidencias(frame) * 3 +
    (rostro && afinidadRostro[rostro]?.includes(frame.id) ? 2 : 0) +
    (generoPreferido && frame.genero === generoPreferido ? 1 : 0)

  const ordenadas = [...frames].sort((a, b) => puntuacion(b) - puntuacion(a))
  const ideales = ordenadas.filter((frame) => frame.category === categoria).slice(0, 6)
  // Si no hay ninguna del tipo buscado (ej. no hay gafas de sol), se muestran más alternativas.
  const otras = ordenadas.filter((frame) => !ideales.includes(frame)).slice(0, ideales.length > 0 ? 3 : 6)
  return { ideales, otras }
}
