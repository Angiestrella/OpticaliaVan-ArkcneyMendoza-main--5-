import { useEffect } from 'react'

// Hace aparecer suavemente los elementos con data-reveal o data-reveal-group
// cuando entran en pantalla (los estilos están en styles/_motion.scss).
// También vigila los que aparecen después (otra página, filtros, resultados).
export function useRevealOnScroll() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const raiz = document.documentElement
    raiz.classList.add('reveal-listo')

    const selector = '[data-reveal]:not(.is-visible), [data-reveal-group]:not(.is-visible)'
    const io = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('is-visible')
          io.unobserve(entrada.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    const observar = (nodo: Element | Document) => {
      if (nodo instanceof Element && nodo.matches(selector)) io.observe(nodo)
      nodo.querySelectorAll(selector).forEach((el) => io.observe(el))
    }
    observar(document)

    const mo = new MutationObserver((cambios) => {
      for (const cambio of cambios) {
        cambio.addedNodes.forEach((nodo) => { if (nodo instanceof Element) observar(nodo) })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      raiz.classList.remove('reveal-listo')
    }
  }, [])
}
