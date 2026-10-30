import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, History, Sparkles } from 'lucide-react'
import { frames, opcionesColor } from '../../data'
import { FaceShapeUpload } from '../../components/FaceShapeUpload/FaceShapeUpload'
import { alternar } from '../../utils/alternar'
import { asset } from '../../utils/asset'
import { recomendar } from '../../utils/recomendar'
import { useFlechas } from '../../utils/useFlechas'
import { IdentificarRostroManual } from './IdentificarRostroManual'
import { OpcionTest } from './OpcionTest'
import { ResultadosTest } from './ResultadosTest'
import { conIndice, estilos, PAUSA_AL_ELEGIR, PREGUNTAS, rostros, tipos } from './opciones'
import { guardarRespuestas, leerRespuestas, type RespuestasTest } from './respuestasGuardadas'
import './TestGafas.scss'

export function TestGafas() {
  const location = useLocation()
  const navigate = useNavigate()
  // Resultado de una visita anterior (se lee una sola vez al abrir la página).
  const [guardadas] = useState<RespuestasTest | null>(leerRespuestas)
  // Si se vuelve con "Atrás" desde la página de una montura recomendada, se muestra
  // otra vez el resultado (la marca queda en el historial, ver el efecto de abajo).
  const [alVolver] = useState(() =>
    (location.state as { verResultado?: boolean } | null)?.verResultado ? guardadas : null,
  )
  const [paso, setPaso] = useState(alVolver ? PREGUNTAS : 0)
  // Flechas para moverse entre las respuestas de cualquier pregunta.
  const flechasRespuestas = useFlechas<HTMLDivElement>('.quiz-option')
  const [direccion, setDireccion] = useState<'adelante' | 'atras'>('adelante')
  const [rostro, setRostro] = useState<string | null>(alVolver?.rostro ?? null)
  const [tipo, setTipo] = useState<string | null>(alVolver?.tipo ?? null)
  const [estilo, setEstilo] = useState<string | null>(alVolver?.estilo ?? null)
  const [colores, setColores] = useState<string[]>(alVolver?.colores ?? [])
  // Desde Inicio, "Te ayudamos con una foto" abre directo esa ayuda (?ayuda=foto).
  const [searchParams] = useSearchParams()
  const [ayudaRostro, setAyudaRostro] = useState(searchParams.get('ayuda') === 'foto')
  const [manualRostro, setManualRostro] = useState(false)
  const [avisoGuardadas, setAvisoGuardadas] = useState(!alVolver)
  const avanceRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(avanceRef.current), [])

  // Mientras se ven los resultados, esta entrada del historial queda marcada: si la
  // persona abre "Ver detalles" de una montura y vuelve con "Atrás", ve sus resultados.
  const enResultados = paso === PREGUNTAS
  const marcada = Boolean((location.state as { verResultado?: boolean } | null)?.verResultado)
  useEffect(() => {
    if (enResultados === marcada) return
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: enResultados ? { verResultado: true } : null })
  }, [enResultados, marcada, navigate, location.pathname, location.search])

  // Cada pregunta nueva se ve desde arriba.
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [paso])

  function irA(nuevo: number) {
    window.clearTimeout(avanceRef.current)
    setDireccion(nuevo >= paso ? 'adelante' : 'atras')
    setPaso(nuevo)
  }

  // Preguntas de una sola respuesta: se marca la opción y avanza solo.
  function elegirYAvanzar(guardar: (id: string) => void, id: string) {
    guardar(id)
    window.clearTimeout(avanceRef.current)
    avanceRef.current = window.setTimeout(() => {
      setDireccion('adelante')
      setPaso((p) => p + 1)
    }, PAUSA_AL_ELEGIR)
  }

  // Al pasar de la última pregunta a los resultados se guardan las respuestas.
  function siguiente() {
    if (paso === PREGUNTAS - 1 && rostro && tipo && estilo) {
      guardarRespuestas({ rostro, tipo, estilo, colores })
    }
    irA(paso + 1)
  }

  function verResultadoGuardado(r: RespuestasTest) {
    setRostro(r.rostro)
    setTipo(r.tipo)
    setEstilo(r.estilo)
    setColores(r.colores)
    setAvisoGuardadas(false)
    irA(PREGUNTAS)
  }

  function reiniciar() {
    irA(0)
    setRostro(null)
    setTipo(null)
    setEstilo(null)
    setColores([])
    setAyudaRostro(false)
    setManualRostro(false)
    setAvisoGuardadas(false)
  }

  const puedeAvanzar =
    (paso === 0 && rostro !== null) ||
    (paso === 1 && tipo !== null) ||
    (paso === 2 && estilo !== null) ||
    (paso === 3 && colores.length > 0)

  const { ideales, otras } = recomendar(frames, tipo, colores, rostro, estilo)

  const resumen = [
    { paso: 0, etiqueta: 'Rostro', valor: rostros.find((r) => r.id === rostro)?.label },
    { paso: 1, etiqueta: 'Buscas', valor: tipos.find((t) => t.id === tipo)?.label },
    { paso: 2, etiqueta: 'Categoría', valor: estilos.find((e) => e.id === estilo)?.label },
    { paso: 3, etiqueta: 'Colores', valor: opcionesColor.filter((c) => colores.includes(c.id)).map((c) => c.label).join(', ') },
  ]

  // Cambia en cada pregunta o sub-vista: así la vista nueva entra con su animación.
  const claveVista = paso === 0 ? `0-${ayudaRostro ? (manualRostro ? 'manual' : 'foto') : 'formas'}` : String(paso)

  // Al cambiar de pregunta, el botón que se tocó desaparece: el foco del
  // teclado pasa al título nuevo para que el lector de pantalla lo lea y la
  // persona siga desde ahí (no desde el inicio de la página).
  // Al abrir la página no se mueve (se compara con la vista anterior).
  const vistaRef = useRef<HTMLDivElement>(null)
  const vistaAnterior = useRef(claveVista)
  useEffect(() => {
    if (vistaAnterior.current === claveVista) return
    vistaAnterior.current = claveVista
    const titulo = vistaRef.current?.querySelector('h1')
    if (!titulo) return
    titulo.tabIndex = -1
    titulo.focus({ preventScroll: true })
  }, [claveVista])

  return (
    <section className="test-gafas">
      <div className="test-gafas__shell" ref={flechasRespuestas}>
        {paso < PREGUNTAS && (
          <header className="test-gafas__top">
            <p className="test-gafas__eyebrow"><Sparkles size={15} aria-hidden="true" /> ¿Qué gafas van contigo?</p>
            <div className="test-gafas__progress">
              {/* Barra propia con role="progressbar": la etiqueta <progress> no permite
                  el degradado ni la animación del relleno en todos los navegadores. */}
              <div
                className="test-gafas__progress-track"
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                role="progressbar"
                aria-label="Progreso del test"
                aria-valuemin={1}
                aria-valuemax={PREGUNTAS}
                aria-valuenow={paso + 1}
              >
                <span className="test-gafas__progress-fill" style={{ width: `${((paso + 1) / PREGUNTAS) * 100}%` }} />
              </div>
              <span className="test-gafas__progress-text">Pregunta {paso + 1} de {PREGUNTAS}</span>
            </div>
          </header>
        )}

        <div ref={vistaRef} key={claveVista} className={`test-gafas__view test-gafas__view--${direccion}`}>
          {paso === 0 && !ayudaRostro && (
            <>
              {guardadas && avisoGuardadas && rostro === null && (
                <div className="test-gafas__guardado">
                  <History size={22} aria-hidden="true" />
                  <p>Ya hiciste el test en este dispositivo. <span>¿Quieres ver de nuevo tus gafas recomendadas?</span></p>
                  <div className="test-gafas__guardado-acciones">
                    <button type="button" className="test-gafas__next" onClick={() => verResultadoGuardado(guardadas)}>
                      Ver mi último resultado
                    </button>
                    <button type="button" className="test-gafas__restart" onClick={() => setAvisoGuardadas(false)}>
                      Empezar de cero
                    </button>
                  </div>
                </div>
              )}
              <div className="test-gafas__head">
                <h1>Selecciona la forma de tu rostro</h1>
                <p className="test-gafas__hint">Elige la que más se parece a ti. Si no estás seguro, te ayudamos con una foto.</p>
              </div>
              <div className="test-gafas__grid test-gafas__grid--rostros">
                {rostros.map((r, i) => (
                  <OpcionTest key={r.id} indice={i} seleccionada={rostro === r.id} onElegir={() => elegirYAvanzar(setRostro, r.id)}>
                    <img className="rostro-photo" src={asset(r.image)} alt={r.imageAlt} width={320} height={320} decoding="async" />
                    <span className="quiz-option__label">{r.label}</span>
                  </OpcionTest>
                ))}
                <button
                  type="button"
                  style={conIndice(rostros.length)}
                  className="quiz-option quiz-option--help"
                  onClick={() => { setManualRostro(false); setAyudaRostro(true) }}
                >
                  <span className="rostro-shape rostro-shape--help" aria-hidden="true">?</span>
                  <span className="quiz-option__label">Identificar con una foto</span>
                </button>
              </div>
            </>
          )}

          {paso === 0 && ayudaRostro && !manualRostro && (
            <div className="test-gafas__photo-help">
              <button type="button" className="test-gafas__back test-gafas__back--top" onClick={() => setAyudaRostro(false)}>
                <ArrowLeft size={18} aria-hidden="true" /> Volver a las formas
              </button>
              <FaceShapeUpload
                onSelect={(shape) => { setRostro(shape); setAyudaRostro(false); irA(1) }}
                onManual={() => setManualRostro(true)}
              />
            </div>
          )}

          {paso === 0 && ayudaRostro && manualRostro && (
            <IdentificarRostroManual
              onIdentificar={(identificado) => { setRostro(identificado); setAyudaRostro(false) }}
              onVolver={() => setAyudaRostro(false)}
            />
          )}

          {paso === 1 && (
            <>
              <div className="test-gafas__head">
                <h1>¿Qué buscas?</h1>
                <p className="test-gafas__hint">Así te mostramos el tipo de gafas que necesitas.</p>
              </div>
              <div className="test-gafas__grid test-gafas__grid--tipos">
                {tipos.map(({ id, label, descripcion, Icon }, i) => (
                  <OpcionTest key={id} indice={i} variante="wide" seleccionada={tipo === id} onElegir={() => elegirYAvanzar(setTipo, id)}>
                    <span className="quiz-option__icon" aria-hidden="true"><Icon size={28} strokeWidth={1.8} /></span>
                    <span className="quiz-option__text">
                      <span className="quiz-option__label">{label}</span>
                      <small>{descripcion}</small>
                    </span>
                  </OpcionTest>
                ))}
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <div className="test-gafas__head">
                <h1>¿Qué categoría prefieres?</h1>
                <p className="test-gafas__hint">También puedes elegir modelos unisex.</p>
              </div>
              <div className="test-gafas__grid test-gafas__grid--estilos">
                {estilos.map((e, i) => {
                  const ejemplo = frames.find((f) => f.id === e.ejemplo)?.colors[0]?.image
                  return (
                    <OpcionTest key={e.id} indice={i} seleccionada={estilo === e.id} onElegir={() => elegirYAvanzar(setEstilo, e.id)}>
                      {ejemplo && <img className="quiz-option__frame" src={asset(ejemplo)} alt="" loading="lazy" decoding="async" />}
                      <span className="quiz-option__label">{e.label}</span>
                    </OpcionTest>
                  )
                })}
              </div>
            </>
          )}

          {paso === 3 && (
            <>
              <div className="test-gafas__head">
                <h1>¿Qué colores te gustan?</h1>
                <p className="test-gafas__hint">Puedes elegir más de uno.</p>
              </div>
              <div className="test-gafas__grid test-gafas__grid--colores">
                {opcionesColor.map((c, i) => (
                  <OpcionTest
                    key={c.id}
                    indice={i}
                    variante="color"
                    seleccionada={colores.includes(c.id)}
                    onElegir={() => setColores((actuales) => alternar(actuales, c.id))}
                  >
                    <span className="quiz-option__swatch" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                    <span className="quiz-option__label">{c.label}</span>
                  </OpcionTest>
                ))}
              </div>
            </>
          )}

          {paso === PREGUNTAS && (
            <ResultadosTest
              ideales={ideales}
              otras={otras}
              resumen={resumen}
              onEditar={irA}
              onReiniciar={reiniciar}
            />
          )}
        </div>

        {/* Atrás / Siguiente. En la ayuda con foto o manual cada vista trae sus propios botones. */}
        {paso < PREGUNTAS && !(paso === 0 && ayudaRostro) && (
          <nav className="test-gafas__nav" aria-label="Navegación del test">
            {paso > 0 && (
              <button type="button" className="test-gafas__back" onClick={() => irA(paso - 1)}>
                <ArrowLeft size={18} aria-hidden="true" /> Atrás
              </button>
            )}
            <button type="button" className="test-gafas__next" disabled={!puedeAvanzar} onClick={siguiente}>
              {paso === PREGUNTAS - 1 ? 'Ver mis gafas' : 'Siguiente'} <ArrowRight size={18} aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </section>
  )
}
