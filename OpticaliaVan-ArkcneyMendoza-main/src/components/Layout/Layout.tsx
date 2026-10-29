import { Suspense, useEffect, useRef, type MouseEvent } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { Footer } from '../Footer/Footer'
import { WhatsAppFloat } from '../WhatsAppFloat/WhatsAppFloat'
import { useRevealOnScroll } from '../../utils/useRevealOnScroll'
import { useScrollAlCambiarDeRuta } from '../../utils/useScrollAlCambiarDeRuta'
import { useSeo } from '../../utils/useSeo'
import { normalizarRuta } from '../../utils/seo'

// Enlace "Saltar al contenido": solo aparece al llegar con la tecla Tab y
// lleva el foco directo al contenido, sin recorrer todo el menú.
function saltarAlContenido(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const contenido = document.getElementById('contenido')
  contenido?.focus({ preventScroll: true })
  contenido?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Estructura que comparten todas las páginas (ruta "padre" en App.tsx):
// barra → contenido de la página (<Outlet />) → pie de página.
export function Layout() {
  const { pathname } = useLocation()
  useRevealOnScroll()
  useScrollAlCambiarDeRuta()
  // Título, descripción y etiquetas para buscadores de la página actual.
  useSeo(pathname)

  // Al cambiar de página, el foco del teclado pasa al contenido nuevo: así el
  // lector de pantalla empieza a leer la página nueva y no se queda en el menú.
  // No se mueve al abrir el sitio (se compara con la página anterior, así
  // funciona aunque React ejecute el efecto dos veces en modo desarrollo), ni
  // si la página ya puso el foco en una ventana (ej. el cotizador).
  const paginaAnterior = useRef(pathname)
  useEffect(() => {
    if (paginaAnterior.current === pathname) return
    paginaAnterior.current = pathname
    if (document.activeElement?.closest('[role="dialog"]')) return
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className="saltar-contenido" href="#contenido" onClick={saltarAlContenido}>
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" tabIndex={-1}>
        {/* Mientras se descarga una página (ver lazy en App.tsx) */}
        <Suspense fallback={<output className="cargando-pagina">Cargando…</output>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {normalizarRuta(pathname) !== '/agenda' && <WhatsAppFloat />}
    </>
  )
}
