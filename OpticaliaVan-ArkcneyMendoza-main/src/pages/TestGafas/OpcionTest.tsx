import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { conIndice } from './opciones'

interface Props {
  indice: number
  seleccionada: boolean
  onElegir: () => void
  variante?: 'wide' | 'color'
  children: ReactNode
}

// Una opción del test: tarjeta que se marca con un check al elegirla.
export function OpcionTest({ indice, seleccionada, onElegir, variante, children }: Props) {
  const clases = ['quiz-option', variante && `quiz-option--${variante}`, seleccionada && 'quiz-option--selected']
  return (
    <button
      type="button"
      style={conIndice(indice)}
      aria-pressed={seleccionada}
      className={clases.filter(Boolean).join(' ')}
      onClick={onElegir}
    >
      <span className="quiz-option__check" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
      {children}
    </button>
  )
}
