// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { guardarRespuestas, leerRespuestas } from './respuestasGuardadas'

const CLAVE = 'opticalia-test-respuestas'

describe('respuestas guardadas del test (JSON en localStorage)', () => {
  beforeEach(() => localStorage.clear())

  it('lo que se guarda se puede volver a leer', () => {
    const respuestas = { rostro: 'ovalado', tipo: 'sol', estilo: 'unisex', colores: ['negro'] }
    guardarRespuestas(respuestas)
    expect(leerRespuestas()).toEqual(respuestas)
  })

  it('sin nada guardado devuelve null', () => {
    expect(leerRespuestas()).toBeNull()
  })

  it('ignora un texto que no es JSON', () => {
    localStorage.setItem(CLAVE, '{roto')
    expect(leerRespuestas()).toBeNull()
  })

  it('ignora respuestas que ya no existen en el test', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ rostro: 'inventado', tipo: 'sol', estilo: 'unisex', colores: ['negro'] }))
    expect(leerRespuestas()).toBeNull()
  })

  it('descarta colores desconocidos pero conserva los válidos', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ rostro: 'ovalado', tipo: 'sol', estilo: 'unisex', colores: ['negro', 'fucsia-neon'] }))
    expect(leerRespuestas()?.colores).toEqual(['negro'])
  })
})
