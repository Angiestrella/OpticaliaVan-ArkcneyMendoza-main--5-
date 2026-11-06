import type { CSSProperties } from 'react'
import { Glasses, Layers, Sun } from 'lucide-react'
import { FORMAS_ROSTRO } from '../TestRostro/formasRostro'
import type { FormaRostro } from '../TestRostro/identificarRostro'

// Opciones de cada pregunta del test. Los colores salen de src/data/colors.json.

// Las formas son las mismas del test de rostro, con sus fotos.
const ORDEN_ROSTROS: FormaRostro[] = ['diamante', 'redondo', 'rectangular', 'ovalado', 'corazon', 'triangular']
export const rostros = ORDEN_ROSTROS.map((id) => ({ id, label: FORMAS_ROSTRO[id].label, image: FORMAS_ROSTRO[id].imagen, imageAlt: FORMAS_ROSTRO[id].alt }))

// El id "recetadas" se conserva para que sigan sirviendo los resultados ya guardados.
export const tipos = [
  { id: 'recetadas', label: 'Oftálmicas', descripcion: 'Para usar con tu fórmula en el día a día.', Icon: Glasses },
  { id: 'sol', label: 'Sol', descripcion: 'Protección y estilo al aire libre.', Icon: Sun },
  { id: 'easy-click', label: 'Easy Click', descripcion: 'Dos en una: oftálmicas con un clip de sol que pones y quitas.', Icon: Layers },
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
