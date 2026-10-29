import { useEffect } from 'react'
import { frames, seo } from '../data'
import { datosSeo, jsonLdSitio, type DatosSeo } from './seo'

// Crea, cambia o quita una etiqueta <meta> del <head>.
function ponerMeta(atributo: 'name' | 'property', clave: string, contenido: string | null) {
  let etiqueta = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${clave}"]`)
  if (contenido === null) {
    etiqueta?.remove()
    return
  }
  if (!etiqueta) {
    etiqueta = document.createElement('meta')
    etiqueta.setAttribute(atributo, clave)
    document.head.append(etiqueta)
  }
  etiqueta.content = contenido
}

function ponerCanonica(href: string | null) {
  let enlace = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (href === null) {
    enlace?.remove()
    return
  }
  if (!enlace) {
    enlace = document.createElement('link')
    enlace.rel = 'canonical'
    document.head.append(enlace)
  }
  enlace.href = href
}

function ponerJsonLd(id: string, datos: Record<string, unknown> | null) {
  let script = document.getElementById(id)
  if (datos === null) {
    script?.remove()
    return
  }
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.setAttribute('type', 'application/ld+json')
    document.head.append(script)
  }
  script.textContent = JSON.stringify(datos)
}

export function aplicarSeo(d: DatosSeo) {
  document.title = d.titulo
  ponerMeta('name', 'description', d.descripcion)
  ponerMeta('name', 'robots', d.indexar ? 'index, follow' : 'noindex, follow')
  ponerCanonica(d.canonica)
  ponerMeta('property', 'og:title', d.tituloCorto)
  ponerMeta('property', 'og:description', d.descripcion)
  ponerMeta('property', 'og:url', d.canonica)
  ponerMeta('property', 'og:image', d.imagen)
  ponerMeta('property', 'og:image:alt', d.imagenAlt)
  ponerMeta('property', 'og:image:width', d.imagenAncho ? String(d.imagenAncho) : null)
  ponerMeta('property', 'og:image:height', d.imagenAlto ? String(d.imagenAlto) : null)
  ponerMeta('name', 'twitter:title', d.tituloCorto)
  ponerMeta('name', 'twitter:description', d.descripcion)
  ponerMeta('name', 'twitter:image', d.imagen)
  ponerJsonLd('seo-sitio', jsonLdSitio(seo))
  ponerJsonLd('seo-pagina', d.jsonLdPagina)
}

// Al cambiar de página se actualizan el título de la pestaña, la descripción
// y el resto de etiquetas para buscadores y para compartir el enlace.
// Los textos salen de src/data/seo.json (y de frames.json en cada montura).
export function useSeo(pathname: string) {
  useEffect(() => {
    aplicarSeo(datosSeo(pathname, seo, frames))
  }, [pathname])
}
