import { useEffect, type RefObject } from 'react'

// Efecto de profundidad: mientras se baja por la página, la foto de la
// sección se mueve un poco más lento que el resto. Escribe la variable CSS
// --parallax en la sección; el CSS la usa para mover la imagen.
export function useParallax(ref: RefObject<HTMLElement | null>, intensidad = 0.12) {
  useEffect(() => {
    const seccion = ref.current
    if (!seccion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let pendiente = 0
    const actualizar = () => {
      pendiente = 0
      const r = seccion.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      // 0 cuando la sección está centrada en pantalla; negativo/positivo arriba/abajo.
      const desdeElCentro = r.top + r.height / 2 - window.innerHeight / 2
      seccion.style.setProperty('--parallax', `${(desdeElCentro * -intensidad).toFixed(1)}px`)
    }
    const alHacerScroll = () => { if (!pendiente) pendiente = requestAnimationFrame(actualizar) }

    actualizar()
    window.addEventListener('scroll', alHacerScroll, { passive: true })
    window.addEventListener('resize', alHacerScroll)
    return () => {
      cancelAnimationFrame(pendiente)
      window.removeEventListener('scroll', alHacerScroll)
      window.removeEventListener('resize', alHacerScroll)
    }
  }, [ref, intensidad])
}
