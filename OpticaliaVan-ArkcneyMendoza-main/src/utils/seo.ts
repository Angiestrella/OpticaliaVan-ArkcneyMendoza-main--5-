import type { Frame } from '../data/types'

// SEO del sitio en un solo lugar. Este archivo NO importa nada en tiempo de
// ejecución: lo usan la página (utils/useSeo.ts, en el navegador) y el script
// de publicación (scripts/seo-estatico.mjs, en Node), así los dos generan
// exactamente los mismos títulos, descripciones y datos estructurados.

export interface SeoSitio {
  nombre: string
  url: string // sin "/" al final
  idioma: string
  locale: string
  tituloInicio: string
  imagen: string
  imagenAncho: number
  imagenAlto: number
  imagenAlt: string
  logo: string
  telefono: string
  direccion: { calle: string; ciudad: string; region: string; pais: string }
  mapa: string
  redes: string[]
}

export interface SeoPagina {
  ruta: string
  titulo: string
  h1?: string
  descripcion: string
  frecuencia: string
  prioridad: string
}

export interface SeoConfig {
  sitio: SeoSitio
  paginas: SeoPagina[]
  noEncontrada: { titulo: string; descripcion: string }
}

export interface DatosSeo {
  ruta: string
  titulo: string // texto completo de <title>
  tituloCorto: string // sin el nombre del sitio (para compartir y para el h1 sin JavaScript)
  descripcion: string
  indexar: boolean // false = "noindex" (página no encontrada)
  canonica: string | null
  imagen: string // dirección completa
  imagenAlt: string
  imagenAncho?: number
  imagenAlto?: number
  jsonLdPagina: Record<string, unknown> | null
}

// "/catalogo/" y "/catalogo" son la misma página.
export function normalizarRuta(pathname: string): string {
  const limpia = ('/' + pathname).replace(/\/{2,}/g, '/').replace(/\/+$/, '')
  return limpia === '' ? '/' : limpia
}

export function urlAbsoluta(sitio: SeoSitio, ruta: string): string {
  return sitio.url + (ruta.startsWith('/') ? ruta : '/' + ruta)
}

// La dirección "oficial" de cada página termina en "/": es la que GitHub Pages
// responde directo (sin redirigir), porque cada página es una carpeta con su index.html.
export function urlCanonica(sitio: SeoSitio, ruta: string): string {
  return ruta === '/' ? sitio.url + '/' : sitio.url + ruta + '/'
}

// Las descripciones largas se cortan en la última palabra completa (Google muestra ~155 letras).
export function recortar(texto: string, maximo = 155): string {
  if (texto.length <= maximo) return texto
  const corte = texto.slice(0, maximo - 1)
  return corte.slice(0, corte.lastIndexOf(' ')).replace(/[,.;:]$/, '') + '…'
}

// Las fotos del catálogo se muestran en WebP (livianas). Para la vista previa al
// compartir se usa el PNG original, que aceptan todas las redes y apps de mensajes.
function imagenParaCompartir(imagen: string): string {
  return imagen.replace(/.webp$/i, '.png')
}

function precioCop(valor: number): string {
  return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function tituloCompleto(seo: SeoConfig, titulo: string): string {
  return `${titulo} | ${seo.sitio.nombre}`
}

// Datos estructurados del negocio (schema.org): Google los usa para mostrar la
// óptica con su dirección, teléfono y redes. Solo datos que aparecen en la página.
export function jsonLdSitio(seo: SeoConfig): Record<string, unknown> {
  const { sitio } = seo
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Optician',
        '@id': `${sitio.url}/#optica`,
        name: sitio.nombre,
        url: `${sitio.url}/`,
        image: urlAbsoluta(sitio, sitio.imagen),
        logo: urlAbsoluta(sitio, sitio.logo),
        telephone: sitio.telefono,
        address: {
          '@type': 'PostalAddress',
          streetAddress: sitio.direccion.calle,
          addressLocality: sitio.direccion.ciudad,
          addressRegion: sitio.direccion.region,
          addressCountry: sitio.direccion.pais,
        },
        hasMap: sitio.mapa,
        areaServed: sitio.direccion.ciudad,
        sameAs: sitio.redes,
      },
      {
        '@type': 'WebSite',
        '@id': `${sitio.url}/#sitio`,
        name: sitio.nombre,
        url: `${sitio.url}/`,
        inLanguage: sitio.idioma,
        publisher: { '@id': `${sitio.url}/#optica` },
      },
    ],
  }
}

function jsonLdProducto(seo: SeoConfig, frame: Frame, canonica: string): Record<string, unknown> {
  const { sitio } = seo
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: frame.name,
        description: frame.description,
        sku: frame.id,
        brand: { '@type': 'Brand', name: frame.brand },
        category: frame.category === 'sol' ? 'Gafas de sol' : 'Montura para fórmula',
        color: frame.colors.map((c) => c.label).join(', '),
        image: frame.colors.map((c) => urlAbsoluta(sitio, c.image)),
        offers: {
          '@type': 'Offer',
          price: frame.price,
          priceCurrency: 'COP',
          url: canonica,
          seller: { '@id': `${sitio.url}/#optica` },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Catálogo', item: urlCanonica(sitio, '/catalogo') },
          { '@type': 'ListItem', position: 2, name: frame.name, item: canonica },
        ],
      },
    ],
  }
}

// Título, descripción, imagen y datos estructurados de cualquier dirección del sitio.
export function datosSeo(pathname: string, seo: SeoConfig, frames: Frame[]): DatosSeo {
  const { sitio } = seo
  const ruta = normalizarRuta(pathname)
  const imagenSitio = {
    imagen: urlAbsoluta(sitio, sitio.imagen),
    imagenAlt: sitio.imagenAlt,
    imagenAncho: sitio.imagenAncho,
    imagenAlto: sitio.imagenAlto,
  }

  const pagina = seo.paginas.find((p) => p.ruta === ruta)
  if (pagina) {
    return {
      ruta,
      titulo: ruta === '/' ? sitio.tituloInicio : tituloCompleto(seo, pagina.titulo),
      tituloCorto: pagina.titulo,
      descripcion: pagina.descripcion,
      indexar: true,
      canonica: urlCanonica(sitio, ruta),
      ...imagenSitio,
      jsonLdPagina: null,
    }
  }

  const producto = /^\/producto\/([^/]+)$/.exec(ruta)
  const frame = producto ? frames.find((f) => f.id === decodeURIComponent(producto[1])) : undefined
  if (frame) {
    const canonica = urlCanonica(sitio, ruta)
    const tipo = frame.category === 'sol' ? 'gafas de sol' : 'montura para fórmula'
    return {
      ruta,
      titulo: tituloCompleto(seo, `${frame.name}, ${tipo}`),
      tituloCorto: frame.name,
      descripcion: recortar(`${frame.name}: ${tipo} desde ${precioCop(frame.price)}. ${frame.description}`),
      indexar: true,
      canonica,
      imagen: urlAbsoluta(sitio, imagenParaCompartir(frame.colors[0].image)),
      imagenAlt: `${frame.name} — ${frame.colors[0].label}`,
      jsonLdPagina: jsonLdProducto(seo, frame, canonica),
    }
  }

  // Dirección que no existe: se muestra el aviso, pero Google no debe guardarla.
  return {
    ruta,
    titulo: tituloCompleto(seo, seo.noEncontrada.titulo),
    tituloCorto: seo.noEncontrada.titulo,
    descripcion: seo.noEncontrada.descripcion,
    indexar: false,
    canonica: null,
    ...imagenSitio,
    jsonLdPagina: null,
  }
}

// Todas las páginas que deben aparecer en Google: las de seo.json y una por montura.
export function rutasIndexables(seo: SeoConfig, frames: Frame[]): string[] {
  return [...seo.paginas.map((p) => p.ruta), ...frames.map((f) => `/producto/${f.id}`)]
}

// ---------- Versión en texto HTML (la usa el script de publicación) ----------

export function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Dentro de <script> un "</" cerraría la etiqueta antes de tiempo.
function jsonEnScript(datos: Record<string, unknown>): string {
  return JSON.stringify(datos).replace(/</g, '\\u003c')
}

// Etiquetas del <head> para una página: título, descripción, dirección oficial,
// vista previa al compartir (Open Graph y Twitter) y datos estructurados.
export function etiquetasHead(datos: DatosSeo, seo: SeoConfig): string {
  const e = escaparHtml
  const lineas = [
    `<title>${e(datos.titulo)}</title>`,
    `<meta name="description" content="${e(datos.descripcion)}" />`,
    `<meta name="robots" content="${datos.indexar ? 'index, follow' : 'noindex, follow'}" />`,
    datos.canonica ? `<link rel="canonical" href="${e(datos.canonica)}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${e(seo.sitio.nombre)}" />`,
    `<meta property="og:locale" content="${e(seo.sitio.locale)}" />`,
    `<meta property="og:title" content="${e(datos.tituloCorto)}" />`,
    `<meta property="og:description" content="${e(datos.descripcion)}" />`,
    datos.canonica ? `<meta property="og:url" content="${e(datos.canonica)}" />` : '',
    `<meta property="og:image" content="${e(datos.imagen)}" />`,
    `<meta property="og:image:alt" content="${e(datos.imagenAlt)}" />`,
    datos.imagenAncho ? `<meta property="og:image:width" content="${datos.imagenAncho}" />` : '',
    datos.imagenAlto ? `<meta property="og:image:height" content="${datos.imagenAlto}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${e(datos.tituloCorto)}" />`,
    `<meta name="twitter:description" content="${e(datos.descripcion)}" />`,
    `<meta name="twitter:image" content="${e(datos.imagen)}" />`,
    `<script type="application/ld+json" id="seo-sitio">${jsonEnScript(jsonLdSitio(seo))}</script>`,
    datos.jsonLdPagina ? `<script type="application/ld+json" id="seo-pagina">${jsonEnScript(datos.jsonLdPagina)}</script>` : '',
  ]
  return lineas.filter(Boolean).join('\n    ')
}

// Contenido para quien abre la página sin JavaScript (y para buscadores que no
// lo ejecutan): el título, la descripción y enlaces a todas las páginas.
export function contenidoSinJavascript(datos: DatosSeo, seo: SeoConfig): string {
  const e = escaparHtml
  const h1 = seo.paginas.find((p) => p.ruta === datos.ruta)?.h1 ?? datos.tituloCorto
  const enlaces = seo.paginas
    .map((p) => `<li><a href="${e(urlCanonica(seo.sitio, p.ruta))}">${e(p.titulo)}</a></li>`)
    .join('')
  return `<noscript><main><h1>${e(h1)}</h1><p>${e(datos.descripcion)}</p><p>Para usar el catálogo, el test y el probador, activa JavaScript en tu navegador.</p><nav aria-label="Páginas del sitio"><ul>${enlaces}</ul></nav></main></noscript>`
}

// Mapa del sitio para buscadores (protocolo sitemaps.org).
export function sitemapXml(seo: SeoConfig, frames: Frame[], fecha: string): string {
  const porRuta = new Map(seo.paginas.map((p) => [p.ruta, p]))
  const urls = rutasIndexables(seo, frames).map((ruta) => {
    const pagina = porRuta.get(ruta)
    return [
      '  <url>',
      `    <loc>${escaparHtml(urlCanonica(seo.sitio, ruta))}</loc>`,
      `    <lastmod>${fecha}</lastmod>`,
      `    <changefreq>${pagina?.frecuencia ?? 'monthly'}</changefreq>`,
      `    <priority>${pagina?.prioridad ?? '0.6'}</priority>`,
      '  </url>',
    ].join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generado por scripts/seo-estatico.mjs a partir de src/data/seo.json y src/data/frames.json -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

export function robotsTxt(seo: SeoConfig): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${seo.sitio.url}/sitemap.xml\n`
}
