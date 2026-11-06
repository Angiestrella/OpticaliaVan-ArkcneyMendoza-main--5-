import { describe, expect, it } from 'vitest'
import { frames } from '../data'
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

  it('en "ideales" solo pone monturas en los colores elegidos', () => {
    // diseno-1 es la única oftálmica con negro.
    const { ideales } = recomendar(catalogo, 'recetadas', ['negro'])
    expect(ideales.map((f) => f.id)).toEqual(['diseno-1'])
  })

  it('la categoría (mujer/hombre) ordena las que están en tus colores', () => {
    // diseno-2 y diseno-4 tienen morado; solo diseno-4 es de mujer.
    const { ideales } = recomendar(catalogo, 'recetadas', ['morado'], null, 'mujer')
    expect(ideales.map((f) => f.id)).toEqual(['diseno-4', 'diseno-2'])
  })

  it('"otras" no repite las ideales y dice por qué se sugiere cada una', () => {
    const { ideales, otras } = recomendar(catalogo, 'recetadas', ['negro'])
    expect(otras.every(({ frame }) => !ideales.includes(frame))).toBe(true)
    // Primero la de tus colores en otro tipo (sol), luego oftálmicas de otro color.
    expect(otras.map(({ frame }) => frame.id)).toEqual(['diseno-3', 'diseno-2', 'diseno-4'])
    expect(otras[0].motivo).toBe('En tus colores · Gafas de sol')
    expect(otras[1].motivo).toBe('En otro color')
  })

  it('si no hay del tipo buscado en esos colores, sugiere hasta 6 alternativas', () => {
    const soloRecetadas = Array.from({ length: 8 }, (_, i) => montura(`formula-${i}`, 'formula', 'unisex', ['negro']))
    const { ideales, otras } = recomendar(soloRecetadas, 'sol', ['negro'])
    expect(ideales).toEqual([])
    expect(otras).toHaveLength(6)
  })
})

it('la forma del rostro cambia las monturas recomendadas', () => {
  const formas = ['diamante', 'redondo', 'rectangular', 'ovalado', 'corazon', 'triangular']
  const primeras = formas.map((rostro) => recomendar(frames, 'recetadas', ['negro'], rostro, 'unisex').ideales[0].id)
  expect(new Set(primeras).size).toBeGreaterThan(1)
})
