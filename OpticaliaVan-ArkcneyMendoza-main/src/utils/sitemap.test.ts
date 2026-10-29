// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseEnlacesSitio } from './sitemap'

describe('parseEnlacesSitio (lee public/navegacion.xml)', () => {
  it('convierte cada <enlace> en un objeto', () => {
    const xml = `<mapaDelSitio>
      <enlace href="/" label="Inicio" menu="si" />
      <enlace href="/conocenos#ubicacion" label="Ubicación" menu="si" seccion="si" />
      <enlace href="/agenda" label="Agenda tu cita" />
    </mapaDelSitio>`
    expect(parseEnlacesSitio(xml)).toEqual([
      { href: '/', label: 'Inicio', menu: true, seccion: false },
      { href: '/conocenos#ubicacion', label: 'Ubicación', menu: true, seccion: true },
      { href: '/agenda', label: 'Agenda tu cita', menu: false, seccion: false },
    ])
  })

  it('avisa si el XML está mal escrito', () => {
    expect(() => parseEnlacesSitio('<mapaDelSitio><enlace href="/"')).toThrow('mal formado')
  })

  it('avisa si a un enlace le falta href o label', () => {
    expect(() => parseEnlacesSitio('<mapaDelSitio><enlace href="/" /></mapaDelSitio>')).toThrow('href y label')
  })
})
