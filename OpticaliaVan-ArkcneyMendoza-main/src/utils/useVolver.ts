import { useNavigate } from 'react-router-dom'

// true si antes de esta pantalla hubo otra de la página en esta pestaña
// (React Router guarda en history.state.idx cuántas entradas lleva).
function hayPantallaAnterior() {
  return (window.history.state?.idx ?? 0) > 0
}

// Regla de todos los botones "Volver", "Anterior" y "Salir" de la página:
// llevan a donde la persona estaba, igual que el "Atrás" del navegador.
// Solo si entró directo (un enlace, un marcador, una pestaña nueva) no hay a
// dónde volver, y se va a "alternativa" (por eso el texto del botón debe
// nombrar ese destino en ese caso).
export function useVolver() {
  const navigate = useNavigate()
  return (alternativa: string) => {
    if (hayPantallaAnterior()) navigate(-1)
    else navigate(alternativa, { replace: true })
  }
}
