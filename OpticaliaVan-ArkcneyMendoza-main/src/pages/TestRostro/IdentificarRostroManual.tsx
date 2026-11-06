import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { asset } from '../../utils/asset'
import { OpcionTest } from '../TestGafas/OpcionTest'
import type { RespuestasRostro } from './identificarRostro'
import { PREGUNTAS_ROSTRO } from './preguntasRostro'

interface Props {
  indice: number
  respuestas: Partial<RespuestasRostro>
  onElegir: (pregunta: keyof RespuestasRostro, opcion: string) => void
  onSiguiente: () => void
  onAnterior: () => void
}

// Una pregunta del test manual de rostro. La pregunta actual y las respuestas las
// lleva TestRostro, para que cada una tenga su dirección y "Atrás" funcione.
export function IdentificarRostroManual({ indice, respuestas, onElegir, onSiguiente, onAnterior }: Props) {
  const pregunta = PREGUNTAS_ROSTRO[indice]
  const elegida = respuestas[pregunta.id]
  const esLaUltima = indice === PREGUNTAS_ROSTRO.length - 1

  // Entra por la derecha al avanzar y por la izquierda al retroceder.
  const [indiceMostrado, setIndiceMostrado] = useState(indice)
  const [direccion, setDireccion] = useState<'adelante' | 'atras'>('adelante')
  if (indice !== indiceMostrado) {
    setIndiceMostrado(indice)
    setDireccion(indice > indiceMostrado ? 'adelante' : 'atras')
  }

  // Al cambiar de pregunta: se ve desde arriba y el foco pasa a la pregunta
  // nueva (para teclado y lector de pantalla). No al abrir la vista.
  const preguntaRef = useRef<HTMLHeadingElement>(null)
  const primeraVez = useRef(true)
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
    preguntaRef.current?.focus({ preventScroll: true })
  }, [indice])

  return (
    <div className="rostro-manual">
      <header className="test-gafas__top">
        <p className="test-gafas__eyebrow">¿Qué tipo de rostro tengo?</p>
        <div className="test-gafas__progress">
          <div
            className="test-gafas__progress-track"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="progressbar"
            aria-label="Progreso del test de rostro"
            aria-valuemin={1}
            aria-valuemax={PREGUNTAS_ROSTRO.length}
            aria-valuenow={indice + 1}
          >
            <span className="test-gafas__progress-fill" style={{ width: `${((indice + 1) / PREGUNTAS_ROSTRO.length) * 100}%` }} />
          </div>
          <span className="test-gafas__progress-text">Pregunta {indice + 1} de {PREGUNTAS_ROSTRO.length}</span>
        </div>
      </header>

      <div key={pregunta.id} className={`test-gafas__view test-gafas__view--${direccion}`}>
        <div className="test-gafas__head">
          <h1 ref={preguntaRef} tabIndex={-1}>{pregunta.titulo}</h1>
          <p className="test-gafas__hint">{pregunta.ayuda}</p>
        </div>

        <div className={`rostro-manual__grid rostro-manual__grid--${pregunta.tipo} rostro-manual__grid--${pregunta.opciones.length}`}>
          {pregunta.opciones.map((opcion, i) => (
            <OpcionTest key={opcion.id} indice={i} seleccionada={elegida === opcion.id} onElegir={() => onElegir(pregunta.id, opcion.id)}>
              <span className="rostro-manual__media">
                <img className="rostro-manual__img" src={asset(opcion.imagen)} alt={opcion.alt} decoding="async" />
              </span>
              {pregunta.tipo !== 'ilustracion' && <span className="quiz-option__label">{opcion.label}</span>}
            </OpcionTest>
          ))}
        </div>
      </div>

      <nav className="test-gafas__nav" aria-label="Navegación del test de rostro">
        <button type="button" className="test-gafas__back" onClick={onAnterior}>
          <ArrowLeft size={18} aria-hidden="true" /> Anterior
        </button>
        <button type="button" className="test-gafas__next" disabled={!elegida} onClick={onSiguiente}>
          {esLaUltima ? 'Ver mi tipo de rostro' : 'Siguiente'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
