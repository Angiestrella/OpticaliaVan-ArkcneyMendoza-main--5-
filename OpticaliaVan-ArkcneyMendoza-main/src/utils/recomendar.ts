import type { Frame } from '../data/types'
import { categoriaDe } from './categorias'

// Una sugerencia de "También te pueden gustar", con el motivo que se muestra en la tarjeta.
export interface Sugerencia {
  frame: Frame
  motivo: string
}

// Respuesta "¿Qué buscas?" del test → category de frames.json.
export function categoriaDelTipo(tipo: string | null) {
  return tipo === 'sol' || tipo === 'easy-click' ? tipo : 'formula'
}

// Los colores en que hay monturas de ese tipo (los únicos que ofrece el test).
export function coloresDelTipo<T extends { id: string }>(frames: Frame[], tipo: string | null, opciones: T[]): T[] {
  const delTipo = frames.filter((frame) => frame.category === categoriaDelTipo(tipo))
  return opciones.filter((opcion) => delTipo.some((frame) => frame.colors.some((c) => c.id === opcion.id)))
}

// El color de la montura que se muestra en el resultado: el primero que
// coincide con los elegidos (así se ve la foto en ese color), o el principal.
export function colorParaMostrar(frame: Frame, colores: string[]) {
  return frame.colors.find((c) => colores.includes(c.id)) ?? frame.colors[0]
}

// "ideales": solo del tipo buscado (oftálmicas, sol o Easy Click) Y en alguno
// de los colores elegidos, ordenadas por afinidad con el rostro y el estilo.
// "otras" ("También te pueden gustar") da más opciones, cada una con su motivo:
// primero en tus colores pero de otro tipo, luego del tipo buscado que van con
// tu rostro aunque sean de otro color.
export function recomendar(
  frames: Frame[],
  tipo: string | null,
  colores: string[],
  rostro: string | null = null,
  estilo: string | null = null,
): { ideales: Frame[]; otras: Sugerencia[] } {
  const categoria = categoriaDelTipo(tipo)
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

  const vaConTuRostro = (frame: Frame) => Boolean(rostro && afinidadRostro[rostro]?.includes(frame.id))
  const puntuacion = (frame: Frame) =>
    (vaConTuRostro(frame) ? 2 : 0) +
    (generoPreferido && frame.genero === generoPreferido ? 1 : 0) +
    // Desempate: la que tiene más de los colores elegidos.
    coincidencias(frame) * 0.5

  const ordenadas = [...frames].sort((a, b) => puntuacion(b) - puntuacion(a))
  const enTusColores = (frame: Frame) => coincidencias(frame) > 0
  const delTipo = (frame: Frame) => frame.category === categoria

  const ideales = ordenadas.filter((frame) => delTipo(frame) && enTusColores(frame)).slice(0, 6)

  const otroTipo: Sugerencia[] = ordenadas
    .filter((frame) => !delTipo(frame) && enTusColores(frame))
    .map((frame) => ({ frame, motivo: `En tus colores · ${categoriaDe(frame).tipo}` }))
  const otroColor: Sugerencia[] = ordenadas
    .filter((frame) => delTipo(frame) && !enTusColores(frame))
    .map((frame) => ({ frame, motivo: vaConTuRostro(frame) ? 'Va con tu rostro · en otro color' : 'En otro color' }))

  // Con ideales: 3 sugerencias, hasta 2 en tus colores y el resto de otro color.
  // Sin ideales (no hay de ese tipo en esos colores): 6, primero las del tipo
  // buscado en otros colores, que es lo más parecido a lo que pidió.
  const otras = ideales.length > 0
    ? [...otroTipo.slice(0, 2), ...otroColor, ...otroTipo.slice(2)].slice(0, 3)
    : [...otroColor.slice(0, 4), ...otroTipo, ...otroColor.slice(4)].slice(0, 6)
  return { ideales, otras }
}
