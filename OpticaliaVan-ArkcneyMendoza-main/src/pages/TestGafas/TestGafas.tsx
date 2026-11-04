import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, History, Sparkles } from 'lucide-react'
import { frames, opcionesColor } from '../../data'
import { FaceShapeUpload } from '../../components/FaceShapeUpload/FaceShapeUpload'
import { alternar } from '../../utils/alternar'
import { asset } from '../../utils/asset'
import { categorias } from '../../utils/categorias'
import { categoriaDelTipo, coloresDelTipo, recomendar } from '../../utils/recomendar'
import { useFlechas } from '../../utils/useFlechas'
import { hayPantallaAnterior, useVolver } from '../../utils/useVolver'
import { IdentificarRostroManual } from './IdentificarRostroManual'
import { OpcionTest } from './OpcionTest'
import { ResultadosTest } from './ResultadosTest'
import { conIndice, estilos, PAUSA_AL_ELEGIR, PREGUNTAS, rostros, tipos } from './opciones'
import { guardarRespuestas, leerRespuestas, type RespuestasTest } from './respuestasGuardadas'
import './TestGafas.scss'

type Ayuda = 'foto' | 'manual'

// Cada vista del test tiene su propia dirección: ?paso=2, ?paso=resultado,
// ?ayuda=foto… Así cada pregunta queda en el historial y el "Atrás" del
// navegador o del celular vuelve a la pregunta anterior en vez de sacar a la
// persona del test. La pregunta 1 no lleva ?paso (es /que-gafas-van-contigo).
function pasoDesdeUrl(valor: string | null): number {
  if (valor === 'resultado') return PREGUNTAS
  const numero = Number(valor)
  return Number.isInteger(numero) && numero >= 1 && numero <= PREGUNTAS ? numero - 1 : 0
}

function buscarDelPaso(paso: number, ayuda?: Ayuda): string {
  const params = new URLSearchParams()
  if (paso > 0) params.set('paso', paso === PREGUNTAS ? 'resultado' : String(paso + 1))
  if (ayuda) params.set('ayuda', ayuda)
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}

export function TestGafas() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paso = pasoDesdeUrl(searchParams.get('paso'))
  // Desde Inicio, "Te ayudamos con una foto" abre directo esa ayuda (?ayuda=foto).
  const ayuda = paso === 0 ? searchParams.get('ayuda') : null
  const ayudaRostro = ayuda === 'foto' || ayuda === 'manual'
  const manualRostro = ayuda === 'manual'
  // De dónde se llegó a esta vista, para que "Volver" diga a dónde lleva:
  // "formas" (se abrió la ayuda desde la pregunta 1) o "inicio" (el enlace de Inicio).
  const desde = (location.state as { desde?: string } | null)?.desde
  const volver = useVolver()

  // Resultado de una visita anterior (se lee una sola vez al abrir la página).
  const [guardadas] = useState<RespuestasTest | null>(leerRespuestas)
  // Si se vuelve con "Atrás" desde la página de una montura recomendada, la
  // página abre en ?paso=resultado sin respuestas en memoria: se usan las guardadas.
  const [alAbrir] = useState(() => (paso === PREGUNTAS ? guardadas : null))
  // Flechas para moverse entre las respuestas de cualquier pregunta.
  const flechasRespuestas = useFlechas<HTMLDivElement>('.quiz-option')
  const [rostro, setRostro] = useState<string | null>(alAbrir?.rostro ?? null)
  const [tipo, setTipo] = useState<string | null>(alAbrir?.tipo ?? null)
  const [estilo, setEstilo] = useState<string | null>(alAbrir?.estilo ?? null)
  const [colores, setColores] = useState<string[]>(alAbrir?.colores ?? [])
  const [avisoGuardadas, setAvisoGuardadas] = useState(!alAbrir)
  const avanceRef = useRef<number | undefined>(undefined)

  // La animación entra por la derecha al avanzar y por la izquierda al
  // retroceder, también cuando se usa el "Atrás" del navegador.
  const [pasoMostrado, setPasoMostrado] = useState(paso)
  const [direccion, setDireccion] = useState<'adelante' | 'atras'>('adelante')
  if (paso !== pasoMostrado) {
    setPasoMostrado(paso)
    setDireccion(paso > pasoMostrado ? 'adelante' : 'atras')
  }

  useEffect(() => () => window.clearTimeout(avanceRef.current), [])

  // No se puede saltar a una pregunta sin responder las anteriores (por ejemplo
  // al recargar en ?paso=3, porque las respuestas no se guardan hasta el final):
  // se lleva a la primera que falta.
  const primeraSinResponder = !rostro ? 0 : !tipo ? 1 : !estilo ? 2 : colores.length === 0 ? 3 : PREGUNTAS
  useEffect(() => {
    if (paso > primeraSinResponder) navigate({ search: buscarDelPaso(primeraSinResponder) }, { replace: true })
  }, [paso, primeraSinResponder, navigate])

  // Cada pregunta nueva se ve desde arriba.
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [paso])

  // Avanzar, abrir una ayuda o saltar a una pregunta crea una entrada nueva en
  // el historial, así cada "Volver" regresa exactamente a la vista anterior.
  function irA(nuevo: number, conAyuda?: Ayuda, origen?: string) {
    window.clearTimeout(avanceRef.current)
    navigate({ search: buscarDelPaso(nuevo, conAyuda) }, { state: origen ? { desde: origen } : null })
  }

  // Todos los "Volver" y "Anterior" del test llevan a donde la persona estaba
  // (como el "Atrás" del navegador): si abrió la ayuda con foto desde Inicio,
  // vuelve a Inicio; si la abrió desde las formas, vuelve a las formas.
  // "alternativa" es solo para quien entró directo a esta vista con un enlace.
  function atras(alternativa: string) {
    window.clearTimeout(avanceRef.current)
    volver(alternativa)
  }
  const rutaDelPaso = (n: number, conAyuda?: Ayuda) => location.pathname + buscarDelPaso(n, conAyuda)
  // La ayuda con foto vuelve a las formas solo si se abrió desde ellas; si no,
  // al Inicio (de donde sale el enlace "¿No conoces la forma de tu rostro?").
  const textoVolverDeFoto = desde === 'formas' ? 'Volver a las formas' : desde === 'inicio' || !hayPantallaAnterior() ? 'Volver al inicio' : 'Volver'

  // Preguntas de una sola respuesta: se marca la opción y avanza solo.
  function elegirYAvanzar(guardar: (id: string) => void, id: string) {
    guardar(id)
    window.clearTimeout(avanceRef.current)
    avanceRef.current = window.setTimeout(() => irA(paso + 1), PAUSA_AL_ELEGIR)
  }

  // Al pasar de la última pregunta a los resultados se guardan las respuestas.
  function siguiente() {
    if (paso === PREGUNTAS - 1 && rostro && tipo && estilo) {
      guardarRespuestas({ rostro, tipo, estilo, colores })
    }
    irA(paso + 1)
  }

  // Al cambiar el tipo (también desde el resumen de resultados) se quitan los
  // colores que ese tipo no tiene; si no queda ninguno, el test pide elegirlos de nuevo.
  function elegirTipo(id: string) {
    setTipo(id)
    const disponibles = coloresDelTipo(frames, id, opcionesColor).map((c) => c.id)
    setColores((actuales) => actuales.filter((c) => disponibles.includes(c)))
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
    setAvisoGuardadas(false)
  }

  const puedeAvanzar =
    (paso === 0 && rostro !== null) ||
    (paso === 1 && tipo !== null) ||
    (paso === 2 && estilo !== null) ||
    (paso === 3 && colores.length > 0)

  const { ideales, otras } = recomendar(frames, tipo, colores, rostro, estilo)
  // La pregunta de colores solo ofrece los que existen en el tipo elegido:
  // así "Ideal para ti" nunca queda vacío por pedir un color que no hay.
  const coloresDisponibles = coloresDelTipo(frames, tipo, opcionesColor)

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
                <p className="test-gafas__hint">Elige la que más se parece a ti. Si no estás seguro, te ayudamos con una foto o con unas preguntas.</p>
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
                  onClick={() => irA(0, 'foto', 'formas')}
                >
                  <span className="rostro-shape rostro-shape--help" aria-hidden="true">?</span>
                  <span className="quiz-option__label">Identificar con una foto o manual</span>
                </button>
              </div>
            </>
          )}

          {paso === 0 && ayudaRostro && !manualRostro && (
            <div className="test-gafas__photo-help">
              <button type="button" className="test-gafas__back test-gafas__back--top" onClick={() => atras('/')}>
                <ArrowLeft size={18} aria-hidden="true" /> {textoVolverDeFoto}
              </button>
              {/* Con el rostro identificado sigue a la pregunta 2; desde ahí,
                  "Anterior" vuelve a esta ayuda, que es donde estaba. */}
              <FaceShapeUpload
                onSelect={(shape) => { setRostro(shape); irA(1) }}
                onManual={() => irA(0, 'manual')}
              />
            </div>
          )}

          {paso === 0 && ayudaRostro && manualRostro && (
            <IdentificarRostroManual
              // Igual que con la foto: identificado el rostro, sigue a la pregunta 2.
              onIdentificar={(identificado) => { setRostro(identificado); irA(1) }}
              // Solo se llega aquí desde la ayuda con foto: "Volver" regresa a ella.
              onVolver={() => atras(rutaDelPaso(0, 'foto'))}
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
                  <OpcionTest key={id} indice={i} variante="wide" seleccionada={tipo === id} onElegir={() => elegirYAvanzar(elegirTipo, id)}>
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
                <p className="test-gafas__hint">
                  Puedes elegir más de uno. Son los colores en que tenemos {categorias.find((c) => c.id === categoriaDelTipo(tipo))?.plural ?? 'gafas'}.
                </p>
              </div>
              <div className="test-gafas__grid test-gafas__grid--colores">
                {coloresDisponibles.map((c, i) => (
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
              colores={colores}
              resumen={resumen}
              onEditar={irA}
              onReiniciar={reiniciar}
            />
          )}
        </div>

        {/* Anterior / Siguiente. En la ayuda con foto o manual cada vista trae sus propios botones.
            En la pregunta 1 no hay "Anterior": para salir del test están el menú y el "Atrás" del navegador. */}
        {paso < PREGUNTAS && !(paso === 0 && ayudaRostro) && (
          <nav className="test-gafas__nav" aria-label="Navegación del test">
            {paso > 0 && (
              <button type="button" className="test-gafas__back" onClick={() => atras(rutaDelPaso(paso - 1))}>
                <ArrowLeft size={18} aria-hidden="true" /> Anterior
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
