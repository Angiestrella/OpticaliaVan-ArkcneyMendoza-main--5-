import type { FormaRostro } from './identificarRostro'

interface FormaInfo {
  label: string
  imagen: string
  alt: string
  clara: string // "Tu rostro ___"
  principal: string // "Tu rostro ___", cuando no destaca tanto
  adjetivo: string // "las formas ___"
  descripcion: string // cómo suele ser: solo para el resultado con foto, que no tiene respuestas
}

export const FORMAS_ROSTRO: Record<FormaRostro, FormaInfo> = {
  ovalado: {
    label: 'Ovalado',
    imagen: '/rostros/ovalado.webp',
    alt: 'Rostro ovalado, con un óvalo marcando su contorno',
    clara: 'es ovalado',
    principal: 'es principalmente ovalado',
    adjetivo: 'ovalada',
    descripcion: 'Suele ser algo más largo que ancho, con los pómulos como parte más amplia y una mandíbula suave.',
  },
  redondo: {
    label: 'Redondo',
    imagen: '/rostros/redondo.webp',
    alt: 'Rostro redondo, con un círculo marcando su contorno',
    clara: 'es redondo',
    principal: 'es principalmente redondo',
    adjetivo: 'redonda',
    descripcion: 'Suele tener un largo y un ancho parecidos, con un contorno curvo y una mandíbula suave.',
  },
  rectangular: {
    label: 'Rectangular',
    imagen: '/rostros/rectangular.webp',
    alt: 'Rostro rectangular, con un rectángulo marcando su contorno',
    clara: 'es rectangular',
    principal: 'es principalmente rectangular',
    adjetivo: 'rectangular',
    descripcion: 'Suele ser más largo que ancho, con un ancho parejo desde la frente hasta una mandíbula recta.',
  },
  diamante: {
    label: 'Diamante',
    imagen: '/rostros/diamante.webp',
    alt: 'Rostro diamante, con un rombo marcando su contorno',
    clara: 'tiene forma de diamante',
    principal: 'tiene una forma principalmente de diamante',
    adjetivo: 'de diamante',
    descripcion: 'Suele tener los pómulos como parte más ancha y estrecharse de forma marcada hacia una mandíbula fina.',
  },
  corazon: {
    label: 'Corazón',
    imagen: '/rostros/corazon.webp',
    alt: 'Rostro de corazón, con un corazón marcando su contorno',
    clara: 'tiene forma de corazón',
    principal: 'tiene una forma principalmente de corazón',
    adjetivo: 'de corazón',
    descripcion: 'Suele tener la frente como parte más ancha y estrecharse de forma marcada hacia una mandíbula fina.',
  },
  triangular: {
    label: 'Triangular',
    imagen: '/rostros/triangular.webp',
    alt: 'Rostro triangular, con un triángulo marcando su contorno',
    clara: 'es triangular',
    principal: 'es principalmente triangular',
    adjetivo: 'triangular',
    descripcion: 'Suele tener la mandíbula como parte más ancha, con un contorno recto y marcado.',
  },
}

export function esFormaRostro(valor: unknown): valor is FormaRostro {
  return typeof valor === 'string' && Object.hasOwn(FORMAS_ROSTRO, valor)
}
