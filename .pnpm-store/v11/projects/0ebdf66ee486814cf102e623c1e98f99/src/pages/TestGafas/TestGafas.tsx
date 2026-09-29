import { useState } from 'react'
import { Link } from 'react-router-dom'
import colorOpciones from '../../data/colors.json'
import frames from '../../data/frames.json'
import { formatPrice } from '../../utils/formatPrice'
import { recomendar } from '../../utils/recomendar'
import './TestGafas.scss'

const rostros = [
  { id: 'diamante', label: 'Diamante' },
  { id: 'redondo', label: 'Redondo' },
  { id: 'cuadrado', label: 'Cuadrado' },
  { id: 'rectangular', label: 'Rectangular' },
]

const tipos = [
  { id: 'recetadas', label: 'Recetadas' },
  { id: 'sol', label: 'Sol' },
]

const estilos = [
  { id: 'mujer', label: 'Mujer' },
  { id: 'hombre', label: 'Hombre' },
]

const TOTAL_PASOS = 5

export function TestGafas() {
  const [paso, setPaso] = useState(0)
  const [rostro, setRostro] = useState<string | null>(null)
  const [tipo, setTipo] = useState<string | null>(null)
  const [estilo, setEstilo] = useState<string | null>(null)
  const [colores, setColores] = useState<string[]>([])

  function toggleColor(id: string) {
    setColores((actual) =>
      actual.includes(id) ? actual.filter((c) => c !== id) : [...actual, id],
    )
  }

  function reiniciar() {
    setPaso(0)
    setRostro(null)
    setTipo(null)
    setEstilo(null)
    setColores([])
  }

  const puedeAvanzar =
    (paso === 0 && rostro !== null) ||
    (paso === 1 && tipo !== null) ||
    (paso === 2 && estilo !== null) ||
    (paso === 3 && colores.length > 0)

  const recomendadas = recomendar(frames, tipo, colores)
  const idsRecomendadas = recomendadas.map((frame) => frame.id)

  return (
    <section className="test-gafas">
      {paso < 4 && (
        <p className="test-gafas__progress">
          Paso {paso + 1} de {TOTAL_PASOS}
        </p>
      )}

      {paso === 0 && (
        <div className="test-gafas__step">
          <h1>Selecciona tu rostro</h1>
          <div className="test-gafas__options">
            {rostros.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`quiz-option ${rostro === r.id ? 'quiz-option--selected' : ''}`}
                onClick={() => setRostro(r.id)}
              >
                <span className={`rostro-shape rostro-shape--${r.id}`} />
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === 1 && (
        <div className="test-gafas__step">
          <h1>¿Qué buscas?</h1>
          <div className="test-gafas__options">
            {tipos.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`quiz-option ${tipo === t.id ? 'quiz-option--selected' : ''}`}
                onClick={() => setTipo(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="test-gafas__step">
          <h1>¿Qué estilo?</h1>
          <div className="test-gafas__options">
            {estilos.map((e) => (
              <button
                key={e.id}
                type="button"
                className={`quiz-option ${estilo === e.id ? 'quiz-option--selected' : ''}`}
                onClick={() => setEstilo(e.id)}
              >
                <span className="quiz-option__photo" />
                {e.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="test-gafas__step">
          <h1>¿Qué colores?</h1>
          <p className="test-gafas__hint">Puedes elegir más de uno.</p>
          <div className="test-gafas__colors">
            {colorOpciones.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`color-swatch ${colores.includes(c.id) ? 'color-swatch--selected' : ''}`}
                style={{ backgroundColor: c.hex }}
                aria-label={c.label}
                onClick={() => toggleColor(c.id)}
              />
            ))}
          </div>
        </div>
      )}

      {paso === 4 && (
        <div className="test-gafas__step">
          <h1>Tus gafas recomendadas</h1>
          <p className="test-gafas__hint">
            Elegidas según lo que buscas y tus colores. La forma de rostro y
            el estilo todavía no influyen en la recomendación.
          </p>
          <div className="test-gafas__results">
            {recomendadas.map((frame) => (
              <div key={frame.id} className="result-card">
                <div className="result-card__photo">
                  <img src={frame.colors[0].image} alt={frame.name} />
                  <Link
                    className="result-card__try-btn"
                    to="/prueba-virtual"
                    state={{
                      recomendadas: idsRecomendadas,
                      seleccionada: frame.id,
                    }}
                  >
                    Probar
                  </Link>
                </div>
                <p className="result-card__name">{frame.name}</p>
                <p className="result-card__price">
                  Desde {formatPrice(frame.price)}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="test-gafas__restart"
            onClick={reiniciar}
          >
            Volver a hacer el test
          </button>
        </div>
      )}

      {paso < 4 && (
        <div className="test-gafas__nav">
          {paso > 0 && (
            <button
              type="button"
              className="test-gafas__back"
              onClick={() => setPaso((p) => p - 1)}
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            className="test-gafas__next"
            disabled={!puedeAvanzar}
            onClick={() => setPaso((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  )
}
