import { useCallback } from 'react'

const DIRECCIONES: Record<string, [number, number]> = {
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0],
  ArrowDown: [0, 1],
  ArrowUp: [0, -1],
}

function centro(elemento: Element) {
  const r = elemento.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

// Elige la opción más cercana en la dirección de la flecha, mirando dónde está
// cada una en pantalla: así funciona igual en filas, columnas y cuadrículas
// (y en celular, donde las mismas opciones se acomodan distinto).
export function opcionEnDireccion(actual: HTMLElement, opciones: HTMLElement[], tecla: string): HTMLElement | undefined {
  if (tecla === 'Home') return opciones[0]
  if (tecla === 'End') return opciones[opciones.length - 1]
  const direccion = DIRECCIONES[tecla]
  if (!direccion) return undefined
  const [dx, dy] = direccion
  const origen = centro(actual)
  let mejor: HTMLElement | undefined
  let mejorPuntaje = Infinity
  for (const opcion of opciones) {
    if (opcion === actual) continue
    const c = centro(opcion)
    const avance = (c.x - origen.x) * dx + (c.y - origen.y) * dy // cuánto está hacia donde apunta la flecha
    if (avance < 4) continue
    const desvio = Math.abs((c.y - origen.y) * dx - (c.x - origen.x) * dy) // cuánto se sale de esa línea
    const puntaje = avance + desvio * 2
    if (puntaje < mejorPuntaje) {
      mejor = opcion
      mejorPuntaje = puntaje
    }
  }
  return mejor
}

// Permite moverse con las flechas (y con Inicio/Fin) entre las opciones de un
// grupo: respuestas del test, colores, opciones de la agenda, menú… Tab sigue
// funcionando igual; las flechas solo mueven el foco, Enter o Espacio eligen.
// Uso: <div ref={useFlechas('.quiz-option')}>…</div>
export function useFlechas<T extends HTMLElement>(selector: string) {
  return useCallback((contenedor: T | null) => {
    if (!contenedor) return
    const alPresionar = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const actual = (e.target as HTMLElement).closest<HTMLElement>(selector)
      if (!actual || !contenedor.contains(actual)) return
      const opciones = [...contenedor.querySelectorAll<HTMLElement>(selector)].filter(
        (opcion) => !opcion.hasAttribute('disabled') && opcion.getClientRects().length > 0,
      )
      const destino = opcionEnDireccion(actual, opciones, e.key)
      if (!destino) return // en el borde: la flecha desplaza la página como siempre
      e.preventDefault()
      destino.focus()
    }
    contenedor.addEventListener('keydown', alPresionar)
    return () => contenedor.removeEventListener('keydown', alPresionar)
  }, [selector])
}
