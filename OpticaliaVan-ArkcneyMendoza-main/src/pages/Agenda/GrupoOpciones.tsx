import { Check, type LucideIcon } from 'lucide-react'
import { useFlechas } from '../../utils/useFlechas'

export interface OpcionAgenda {
  id: string
  label: string
  Icon: LucideIcon
}

interface Props {
  tituloId: string // id del <h2> que nombra el grupo
  opciones: OpcionAgenda[]
  elegidas: string[]
  onElegir: (id: string) => void
}

// Grupo de botones con ícono que se marcan con un check. Lo usan
// "¿Qué necesitas?" (varias respuestas) y "¿Qué horario prefieres?" (una).
// <fieldset>: la etiqueta HTML para agrupar opciones de un formulario.
export function GrupoOpciones({ tituloId, opciones, elegidas, onElegir }: Props) {
  const flechas = useFlechas<HTMLFieldSetElement>('.agenda__option')
  return (
    <fieldset className="agenda__options" aria-labelledby={tituloId} ref={flechas}>
      {opciones.map(({ id, label, Icon }) => {
        const elegida = elegidas.includes(id)
        return (
          <button
            key={id}
            type="button"
            aria-pressed={elegida}
            className={`agenda__option ${elegida ? 'agenda__option--selected' : ''}`}
            onClick={() => onElegir(id)}
          >
            {elegida && (
              <span className="agenda__option-check">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        )
      })}
    </fieldset>
  )
}
