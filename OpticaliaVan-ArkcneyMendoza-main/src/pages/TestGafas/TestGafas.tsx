import { useState } from 'react'
import { Link } from 'react-router-dom'
import colorOpciones from '../../data/colors.json'
import frames from '../../data/frames.json'
import { FaceShapeUpload } from '../../components/FaceShapeUpload/FaceShapeUpload'
import { formatPrice } from '../../utils/formatPrice'
import { recomendar } from '../../utils/recomendar'
import './TestGafas.scss'

const rostros: Array<{ id: string; label: string; image?: string; imageAlt?: string }> = [
  { id: 'diamante', label: 'Diamante', image: '/Retrato%20minimalista%20de%20rostro%20diamante%20(1).png', imageAlt: 'Rostro con forma de diamante' },
  { id: 'redondo', label: 'Redondo', image: '/Retrato%20masculino%20con%20c%C3%ADrculo%20azul.png', imageAlt: 'Rostro con forma redonda' },
  { id: 'rectangular', label: 'Rectangular', image: '/rostro_rectangular_mujer_transparente.png', imageAlt: 'Rostro con forma rectangular' },
  { id: 'ovalado', label: 'Ovalado', image: '/Retrato%20de%20rostro%20ovalado%20con%20contorno%20azul.png', imageAlt: 'Rostro con forma ovalada' },
  { id: 'corazon', label: 'Corazón', image: '/Retrato%20con%20contorno%20facial%20de%20corazón.png', imageAlt: 'Rostro con forma de corazón' },
  { id: 'triangular', label: 'Triangular', image: '/Retrato%20con%20triángulo%20facial%20azul.png', imageAlt: 'Rostro con forma triangular' },
]

const tipos = [
  { id: 'recetadas', label: 'Recetadas' },
  { id: 'sol', label: 'Sol' },
]

const estilos = [
  { id: 'mujer', label: 'Mujer' },
  { id: 'hombre', label: 'Hombre' },
  { id: 'unisex', label: 'Unisex' },
]

const TOTAL_PASOS = 5

export function TestGafas() {
  const [paso, setPaso] = useState(0)
  const [rostro, setRostro] = useState<string | null>(null)
  const [tipo, setTipo] = useState<string | null>(null)
  const [estilo, setEstilo] = useState<string | null>(null)
  const [colores, setColores] = useState<string[]>([])
  const [ayudaRostro, setAyudaRostro] = useState(false)
  const [manualRostro, setManualRostro] = useState(false)
  const [formaCara, setFormaCara] = useState<string | null>(null)
  const [largoCara, setLargoCara] = useState<string | null>(null)

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
    setAyudaRostro(false)
    setManualRostro(false)
    setFormaCara(null)
    setLargoCara(null)
  }

  function identificarRostro() {
    const identificado = formaCara === 'mandibula' ? 'triangular' : formaCara === 'frente' ? 'corazon' : largoCara === 'largo' ? 'rectangular' : 'ovalado'
    setRostro(identificado)
    setAyudaRostro(false)
  }

  const puedeAvanzar =
    (paso === 0 && rostro !== null) ||
    (paso === 1 && tipo !== null) ||
    (paso === 2 && estilo !== null) ||
    (paso === 3 && colores.length > 0)

  const recomendadas = recomendar(frames, tipo, colores, rostro, estilo)
  const idsRecomendadas = recomendadas.map((frame) => frame.id)

  return (
    <section className="test-gafas">
      {paso < 4 && (
        <p className="test-gafas__progress">
          Paso {paso + 1} de {TOTAL_PASOS}
        </p>
      )}

      {paso === 0 && !ayudaRostro && (
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
                {r.image
                  ? <img className="rostro-photo" src={r.image} alt={r.imageAlt} />
                  : <span className={`rostro-shape rostro-shape--${r.id}`} />}
                {r.label}
              </button>
            ))}
            <button type="button" className="quiz-option quiz-option--help" onClick={() => { setManualRostro(false); setAyudaRostro(true) }}><span className="rostro-shape rostro-shape--help">?</span>Identificar con una foto</button>
          </div>
          <p className="test-gafas__hint">Elige la forma que más se parece a tu rostro. Si no estás seguro, te ayudamos.</p>
        </div>
      )}

      {paso === 0 && ayudaRostro && !manualRostro && (
        <FaceShapeUpload onSelect={(shape) => { setRostro(shape); setAyudaRostro(false) }} onManual={() => setManualRostro(true)} />
      )}

      {paso === 0 && ayudaRostro && manualRostro && (
        <div className="test-gafas__step">
          <h1>Identifiquemos tu tipo de rostro</h1>
          <p className="test-gafas__hint">No necesitas medirlo. Elige la descripción que más se parece a ti.</p>
          <h2>{formaCara ? '¿Tu rostro se ve más largo que ancho?' : '¿Qué parte notas más ancha?'}</h2>
          <div className="test-gafas__options">
            {(formaCara ? [['largo', 'Sí, claramente'], ['parejo', 'No, se ve equilibrado']] : [['frente', 'La frente o los pómulos'], ['mandibula', 'La mandíbula'], ['parejo', 'Se ve bastante equilibrado']]).map(([id, label]) => <button key={id} type="button" className={`quiz-option ${(formaCara ? largoCara : formaCara) === id ? 'quiz-option--selected' : ''}`} onClick={() => formaCara ? setLargoCara(id) : setFormaCara(id)}>{label}</button>)}
          </div>
          <div className="test-gafas__nav"><button type="button" className="test-gafas__back" onClick={() => formaCara ? (setFormaCara(null), setLargoCara(null)) : setAyudaRostro(false)}>Atrás</button>
            {formaCara && largoCara && <button type="button" className="test-gafas__next" onClick={identificarRostro}>Continuar con tu recomendación</button>}
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
          <h1>¿Qué categoría prefieres?</h1>
          <p className="test-gafas__hint">También puedes elegir modelos unisex.</p>
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
            Recomendadas según lo que buscas, la forma de tu rostro y tus colores. Pruébatelas virtualmente o consulta disponibilidad con el equipo.
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
