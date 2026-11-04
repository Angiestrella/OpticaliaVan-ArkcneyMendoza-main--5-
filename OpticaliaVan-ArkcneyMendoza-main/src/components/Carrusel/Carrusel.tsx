import { Children, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Carrusel.scss'

// Una sola fila de tarjetas. En escritorio caben las 4; en tableta y celular
// no se bajan a otra fila: se quedan en la misma línea y se pasan con las
// flechas (o deslizando con el dedo). Las flechas solo salen si algo no cabe.
export function Carrusel({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  const pistaRef = useRef<HTMLDivElement>(null)
  const [puedeAtras, setPuedeAtras] = useState(false)
  const [puedeAdelante, setPuedeAdelante] = useState(false)

  useEffect(() => {
    const pista = pistaRef.current
    if (!pista) return
    const actualizar = () => {
      setPuedeAtras(pista.scrollLeft > 4)
      setPuedeAdelante(pista.scrollLeft + pista.clientWidth < pista.scrollWidth - 4)
    }
    actualizar()
    pista.addEventListener('scroll', actualizar, { passive: true })
    // Al girar el celular o cambiar el tamaño de la ventana cambia lo que cabe.
    const observador = new ResizeObserver(actualizar)
    observador.observe(pista)
    return () => {
      pista.removeEventListener('scroll', actualizar)
      observador.disconnect()
    }
  }, [])

  // Cada flecha avanza exactamente una tarjeta (su ancho más el espacio entre ellas).
  function mover(sentido: 1 | -1) {
    const pista = pistaRef.current
    const tarjeta = pista?.firstElementChild as HTMLElement | null
    if (!pista || !tarjeta) return
    const espacio = parseFloat(getComputedStyle(pista).columnGap) || 0
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pista.scrollBy({ left: sentido * (tarjeta.offsetWidth + espacio), behavior: sinMovimiento ? 'auto' : 'smooth' })
  }

  const hayMas = puedeAtras || puedeAdelante

  return (
    // aria-roledescription: el lector de pantalla lo anuncia como "carrusel".
    <section className={`carrusel ${hayMas ? 'carrusel--con-flechas' : ''}`} aria-roledescription="carrusel" aria-label={etiqueta}>
      {hayMas && (
        <button type="button" className="carrusel__flecha carrusel__flecha--atras" disabled={!puedeAtras} onClick={() => mover(-1)} aria-label="Ver las gafas anteriores">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      )}
      <div className="carrusel__pista" ref={pistaRef} data-reveal-group>
        {Children.map(children, (hijo) => <div className="carrusel__item">{hijo}</div>)}
      </div>
      {hayMas && (
        <button type="button" className="carrusel__flecha carrusel__flecha--adelante" disabled={!puedeAdelante} onClick={() => mover(1)} aria-label="Ver más gafas">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      )}
    </section>
  )
}
