import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { OpcionTest } from './OpcionTest'

interface Props {
  onIdentificar: (rostro: string) => void
  onVolver: () => void
}

// Ayuda sin foto: dos preguntas sencillas para deducir la forma del rostro.
export function IdentificarRostroManual({ onIdentificar, onVolver }: Props) {
  const [formaCara, setFormaCara] = useState<string | null>(null)
  const [largoCara, setLargoCara] = useState<string | null>(null)

  const opciones = formaCara
    ? [['largo', 'Sí, claramente'], ['parejo', 'No, se ve equilibrado']]
    : [['frente', 'La frente o los pómulos'], ['mandibula', 'La mandíbula'], ['parejo', 'Se ve bastante equilibrado']]

  function identificar() {
    onIdentificar(
      formaCara === 'mandibula' ? 'triangular'
        : formaCara === 'frente' ? 'corazon'
          : largoCara === 'largo' ? 'rectangular'
            : 'ovalado',
    )
  }

  function atras() {
    if (formaCara) {
      setFormaCara(null)
      setLargoCara(null)
    } else {
      onVolver()
    }
  }

  return (
    <>
      <div className="test-gafas__head">
        <h1>Identifiquemos tu tipo de rostro</h1>
        <p className="test-gafas__hint">No necesitas medirlo. Elige la descripción que más se parece a ti.</p>
      </div>
      <h2 className="test-gafas__question">{formaCara ? '¿Tu rostro se ve más largo que ancho?' : '¿Qué parte notas más ancha?'}</h2>
      <div className="test-gafas__grid test-gafas__grid--tipos">
        {opciones.map(([id, label], i) => (
          <OpcionTest
            key={id}
            indice={i}
            seleccionada={(formaCara ? largoCara : formaCara) === id}
            onElegir={() => formaCara ? setLargoCara(id) : setFormaCara(id)}
          >
            <span className="quiz-option__label">{label}</span>
          </OpcionTest>
        ))}
      </div>
      <nav className="test-gafas__nav" aria-label="Navegación">
        <button type="button" className="test-gafas__back" onClick={atras}>
          <ArrowLeft size={18} aria-hidden="true" /> Atrás
        </button>
        {formaCara && largoCara && (
          <button type="button" className="test-gafas__next" onClick={identificar}>
            Ver mi tipo de rostro <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </nav>
    </>
  )
}
