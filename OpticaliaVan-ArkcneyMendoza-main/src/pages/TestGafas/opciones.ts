import type { CSSProperties } from 'react'
import { Glasses, Sun } from 'lucide-react'

// Opciones de cada pregunta del test. Los colores salen de src/data/colors.json.
// Las fotos de rostros están en WebP de 320 px (~18 KB cada una) para que el test
// cargue rápido; los PNG originales solo los usa la ayuda con foto (FaceShapeUpload).

export const rostros: Array<{ id: string; label: string; image: string; imageAlt: string }> = [
  { id: 'diamante', label: 'Diamante', image: '/rostros/diamante.webp', imageAlt: 'Rostro con forma de diamante' },
  { id: 'redondo', label: 'Redondo', image: '/rostros/redondo.webp', imageAlt: 'Rostro con forma redonda' },
  { id: 'rectangular', label: 'Rectangular', image: '/rostros/rectangular.webp', imageAlt: 'Rostro con forma rectangular' },
  { id: 'ovalado', label: 'Ovalado', image: '/rostros/ovalado.webp', imageAlt: 'Rostro con forma ovalada' },
  { id: 'corazon', label: 'Corazón', image: '/rostros/corazon.webp', imageAlt: 'Rostro con forma de corazón' },
  { id: 'triangular', label: 'Triangular', image: '/rostros/triangular.webp', imageAlt: 'Rostro con forma triangular' },
]

export const tipos = [
  { id: 'recetadas', label: 'Recetadas', descripcion: 'Para usar con tu fórmula en el día a día.', Icon: Glasses },
  { id: 'sol', label: 'Sol', descripcion: 'Protección y estilo al aire libre.', Icon: Sun },
]

// Cada categoría se ilustra con una montura real del catálogo.
export const estilos = [
  { id: 'mujer', label: 'Mujer', ejemplo: 'bahamas-blue-eleuthera' },
  { id: 'hombre', label: 'Hombre', ejemplo: 'oakley-ridge' },
  { id: 'unisex', label: 'Unisex', ejemplo: 'the-look-prisma' },
]

export const PREGUNTAS = 4
// Pausa para que se vea el check antes de pasar a la siguiente pregunta.
export const PAUSA_AL_ELEGIR = 420

// Número de orden para que las opciones aparezcan una tras otra (ver --i en el SCSS).
export const conIndice = (i: number) => ({ '--i': i }) as CSSProperties
