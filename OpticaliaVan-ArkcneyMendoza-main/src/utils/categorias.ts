import type { Frame } from '../data/types'

// Los tres tipos de gafas del catálogo (campo "category" de frames.json).
// slug: cómo va en la dirección, ej. /catalogo?tipo=easy-click
// plural: para los botones, ej. "Ver catálogo completo de gafas de sol"
export const categorias = [
  {
    id: 'sol',
    slug: 'sol',
    label: 'Sol',
    tipo: 'Gafas de sol',
    plural: 'gafas de sol',
    descripcion: 'Protección y estilo al aire libre.',
  },
  {
    id: 'formula',
    slug: 'oftalmicas',
    label: 'Oftálmicas',
    tipo: 'Montura oftálmica',
    plural: 'monturas oftálmicas',
    descripcion: 'Para tus lentes con fórmula, en el día a día.',
  },
  {
    id: 'easy-click',
    slug: 'easy-click',
    label: 'Easy Click',
    tipo: 'Easy Click (2 en 1)',
    plural: 'gafas Easy Click',
    descripcion: 'Dos gafas en una: montura oftálmica con un clip de sol que se pone y se quita en segundos.',
  },
]

export type Categoria = (typeof categorias)[number]

export function categoriaDe(frame: Frame): Categoria {
  return categorias.find((c) => c.id === frame.category) ?? categorias[1]
}

export function categoriaPorSlug(slug: string | null): Categoria | undefined {
  return categorias.find((c) => c.slug === slug)
}
