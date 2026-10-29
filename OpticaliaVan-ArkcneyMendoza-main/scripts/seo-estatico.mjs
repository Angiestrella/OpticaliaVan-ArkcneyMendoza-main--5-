// Se corre después de "vite build" (ver package.json y .github/workflows/deploy.yml).
//
// GitHub Pages solo sirve archivos: si alguien (o Google) abre /catalogo directamente,
// antes respondía "404" y mostraba la app desde 404.html. Este script crea una carpeta
// con su propio index.html para cada página (catalogo/index.html, producto/diseno-1/index.html…),
// cada uno con su título, descripción, vista previa para compartir y datos estructurados.
// Así cada dirección responde "200 OK" y los buscadores ven la información correcta
// aunque no ejecuten JavaScript. También genera sitemap.xml, robots.txt y 404.html.
//
// Uso: node scripts/seo-estatico.mjs [carpeta-del-build]   (por defecto: dist)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// Node 24 entiende TypeScript sin compilar: se usa el mismo código que la página.
import {
  contenidoSinJavascript,
  datosSeo,
  etiquetasHead,
  robotsTxt,
  rutasIndexables,
  sitemapXml,
} from '../src/utils/seo.ts'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(process.argv[2] ?? join(raiz, 'dist'))
const leerJson = (archivo) => JSON.parse(readFileSync(join(raiz, 'src/data', archivo), 'utf8'))
const seo = leerJson('seo.json')
const frames = leerJson('frames.json')

const plantilla = readFileSync(join(dist, 'index.html'), 'utf8')
const BLOQUE_HEAD = /<!-- seo:inicio[\s\S]*?<!-- seo:fin -->/
const MARCA_BODY = '<!-- seo:sin-javascript -->'
if (!BLOQUE_HEAD.test(plantilla) || !plantilla.includes(MARCA_BODY)) {
  throw new Error('index.html no tiene las marcas "seo:inicio", "seo:fin" y "seo:sin-javascript"')
}

// Usa funciones en los reemplazos: así un "$" del texto no se toma como comodín.
function paginaHtml(ruta) {
  const datos = datosSeo(ruta, seo, frames)
  return plantilla
    .replace(BLOQUE_HEAD, () => etiquetasHead(datos, seo))
    .replace(MARCA_BODY, () => contenidoSinJavascript(datos, seo))
}

function escribir(rutaArchivo, contenido) {
  mkdirSync(dirname(rutaArchivo), { recursive: true })
  writeFileSync(rutaArchivo, contenido)
}

const rutas = rutasIndexables(seo, frames)
for (const ruta of rutas) {
  const archivo = ruta === '/' ? join(dist, 'index.html') : join(dist, ...ruta.split('/').filter(Boolean), 'index.html')
  escribir(archivo, paginaHtml(ruta))
}
// Para cualquier otra dirección: la app muestra "Página no encontrada" y Google no la guarda.
escribir(join(dist, '404.html'), paginaHtml('/__pagina-no-encontrada__'))

const hoy = new Date().toISOString().slice(0, 10)
escribir(join(dist, 'sitemap.xml'), sitemapXml(seo, frames, hoy))
escribir(join(dist, 'robots.txt'), robotsTxt(seo))

console.log(`SEO: ${rutas.length} páginas con su propio HTML, más 404.html, sitemap.xml y robots.txt en ${dist}`)
