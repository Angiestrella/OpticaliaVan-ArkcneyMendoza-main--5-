import { describe, expect, it } from 'vitest'
import type { Frame } from '../data/types'
import { recomendar } from './recomendar'

// Monturas de prueba: solo importan los datos que usa la recomendación.
function montura(id: string, category: string, genero: string, colores: string[]): Frame {
  return {
    id, category, genero,
    name: id, price: 100000, brand: 'Prueba', trending: false, silhouette: '', description: '',
    colors: colores.map((c) => ({ id: c, label: c, image: '', photos: [] })),
  }
}

const catalogo = [
  montura('diseno-1', 'formula', 'hombre', ['azul', 'negro']),
  montura('diseno-2', 'formula', 'unisex', ['cafe', 'morado']),
  montura('diseno-3', 'sol', 'hombre', ['dorado', 'negro']),
  montura('diseno-4', 'formula', 'mujer', ['cafe', 'morado']),
]

describe('recomendar', () => {
  it('en "ideales" solo pone monturas del tipo buscado', () => {
    const { ideales } = recomendar(catalogo, 'sol', ['negro'])
    expect(ideales.map((f) => f.id)).toEqual(['diseno-3'])
  })

  it('el color pesa más y la categoría (mujer/hombre) desempata', () => {
    // diseno-2 y diseno-4 tienen morado; solo diseno-4 es de mujer.
    const { ideales } = recomendar(catalogo, 'recetadas', ['morado'], null, 'mujer')
    expect(ideales[0].id).toBe('diseno-4')
    expect(ideales[1].id).toBe('diseno-2')
  })

  it('"otras" no repite las ideales', () => {
    const { ideales, otras } = recomendar(catalogo, 'recetadas', ['negro'])
    expect(otras.every((f) => !ideales.includes(f))).toBe(true)
    expect(otras.map((f) => f.id)).toEqual(['diseno-3'])
  })
})
