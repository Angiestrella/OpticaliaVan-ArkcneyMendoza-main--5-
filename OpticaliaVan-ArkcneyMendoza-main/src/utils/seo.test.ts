import { describe, expect, it } from 'vitest'
import { frames, seo } from '../data'
import {
  contenidoSinJavascript,
  datosSeo,
  etiquetasHead,
  normalizarRuta,
  recortar,
  robotsTxt,
  rutasIndexables,
  sitemapXml,
} from './seo'

const URL = seo.sitio.url

describe('datosSeo', () => {
  it('Inicio usa el título principal y su dirección oficial termina en /', () => {
    const d = datosSeo('/', seo, frames)
    expect(d.titulo).toBe(seo.sitio.tituloInicio)
    expect(d.canonica).toBe(`${URL}/`)
    expect(d.indexar).toBe(true)
  })

  it('cada página tiene un título y una descripción distintos', () => {
    const datos = seo.paginas.map((p) => datosSeo(p.ruta, seo, frames))
    expect(new Set(datos.map((d) => d.titulo)).size).toBe(datos.length)
    expect(new Set(datos.map((d) => d.descripcion)).size).toBe(datos.length)
    for (const d of datos) expect(d.descripcion.length).toBeLessThanOrEqual(170)
  })

  it('"/catalogo" y "/catalogo/" son la misma página', () => {
    expect(datosSeo('/catalogo/', seo, frames)).toEqual(datosSeo('/catalogo', seo, frames))
    expect(datosSeo('/catalogo', seo, frames).canonica).toBe(`${URL}/catalogo/`)
  })

  it('cada montura usa su nombre, su foto y datos de producto con precio en pesos', () => {
    const frame = frames[0]
    const d = datosSeo(`/producto/${frame.id}`, seo, frames)
    expect(d.titulo).toContain(frame.name)
    // Para compartir se usa el PNG original (las fotos de la página son WebP).
    expect(d.imagen).toBe(URL + frame.colors[0].image.replace('.webp', '.png'))
    const grafo = d.jsonLdPagina?.['@graph'] as Array<Record<string, unknown>>
    const producto = grafo.find((n) => n['@type'] === 'Product') as { offers: { price: number; priceCurrency: string } }
    expect(producto.offers).toMatchObject({ price: frame.price, priceCurrency: 'COP' })
    expect(grafo.some((n) => n['@type'] === 'BreadcrumbList')).toBe(true)
  })

  it('una dirección que no existe no se indexa ni tiene dirección oficial', () => {
    const d = datosSeo('/no-existe', seo, frames)
    expect(d.indexar).toBe(false)
    expect(d.canonica).toBeNull()
    expect(datosSeo('/producto/inventado', seo, frames).indexar).toBe(false)
  })
})

describe('HTML para cada página (script de publicación)', () => {
  it('pone título, descripción, canónica, vista previa y datos estructurados', () => {
    const html = etiquetasHead(datosSeo('/agenda', seo, frames), seo)
    expect(html).toContain('<title>Agenda tu cita o examen visual | Opticalia Van-Arcken &amp; Mendoza</title>')
    expect(html).toContain(`<link rel="canonical" href="${URL}/agenda/" />`)
    expect(html).toContain('property="og:image"')
    expect(html).toContain('name="twitter:card"')
    expect(html).toContain('"@type":"Optician"')
  })

  it('la página no encontrada lleva "noindex"', () => {
    expect(etiquetasHead(datosSeo('/x', seo, frames), seo)).toContain('content="noindex, follow"')
  })

  it('el contenido sin JavaScript trae el título y enlaces a todas las páginas', () => {
    const html = contenidoSinJavascript(datosSeo('/catalogo', seo, frames), seo)
    expect(html).toContain('<h1>Catálogo de gafas y monturas</h1>')
    expect(html.match(/<a href=/g)?.length).toBe(seo.paginas.length)
  })

  it('el sitemap incluye todas las páginas y monturas, y robots.txt apunta a él', () => {
    const xml = sitemapXml(seo, frames, '2026-10-28')
    expect(xml.match(/<loc>/g)?.length).toBe(rutasIndexables(seo, frames).length)
    expect(xml).toContain(`<loc>${URL}/producto/${frames[0].id}/</loc>`)
    expect(robotsTxt(seo)).toContain(`Sitemap: ${URL}/sitemap.xml`)
  })
})

describe('ayudas', () => {
  it('normalizarRuta quita barras sobrantes', () => {
    expect(normalizarRuta('/')).toBe('/')
    expect(normalizarRuta('/agenda/')).toBe('/agenda')
    expect(normalizarRuta('//producto//diseno-1/')).toBe('/producto/diseno-1')
  })

  it('recortar corta en una palabra completa y agrega "…"', () => {
    const texto = 'uno dos tres cuatro cinco seis'
    expect(recortar(texto, 100)).toBe(texto)
    expect(recortar(texto, 14)).toBe('uno dos tres…')
  })
})
