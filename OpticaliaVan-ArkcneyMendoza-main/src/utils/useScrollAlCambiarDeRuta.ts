import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Cada página nueva empieza desde arriba; si no, conserva el scroll de la anterior.
// Si el enlace trae una sección (ej. /conocenos#ubicacion), baja hasta ella.
export function useScrollAlCambiarDeRuta() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return
    }

    const id = decodeURIComponent(hash.slice(1))
    const bajar = (seccion: HTMLElement) =>
      requestAnimationFrame(() => seccion.scrollIntoView({ behavior: 'smooth', block: 'start' }))

    const seccion = document.getElementById(id)
    if (seccion) {
      bajar(seccion)
      return
    }

    // La página todavía se está descargando (lazy): se espera a que aparezca la sección.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const observador = new MutationObserver(() => {
      const encontrada = document.getElementById(id)
      if (!encontrada) return
      observador.disconnect()
      bajar(encontrada)
    })
    observador.observe(document.body, { childList: true, subtree: true })
    const limite = window.setTimeout(() => observador.disconnect(), 5000)
    return () => {
      observador.disconnect()
      window.clearTimeout(limite)
    }
  }, [pathname, hash, key])
}
