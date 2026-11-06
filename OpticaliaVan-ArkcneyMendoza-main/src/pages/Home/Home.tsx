import { useRef, useState, type CSSProperties } from 'react'
import { Carrusel } from '../../components/Carrusel/Carrusel'
import { FrameCard } from '../../components/FrameCard/FrameCard'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, Glasses, MessageCircleQuestion, Palette, ScanFace, UserRound } from 'lucide-react'
import { frames } from '../../data'
import { asset } from '../../utils/asset'
import { categorias } from '../../utils/categorias'
import { useFlechas } from '../../utils/useFlechas'
import { useParallax } from '../../utils/useParallax'
import './Home.scss'

// Las 4 preguntas del test de gafas, para que se entienda qué va a pasar antes de empezar.
const pasosTest = [
  { label: 'Tu rostro', Icon: ScanFace },
  { label: 'Qué buscas', Icon: Glasses },
  { label: 'Tu estilo', Icon: UserRound },
  { label: 'Tus colores', Icon: Palette },
]

// Inicio muestra 4 tarjetas por sección (una fila); el resto está en el catálogo.
const TARJETAS_POR_SECCION = 4
// Las que salen primero en cada pestaña de "Elige tu tipo de gafas", de
// marcas distintas para mostrar variedad. Si alguna ya no existe, se completa
// con otras de ese tipo que no estén ya en Tendencias.
const DESTACADAS_EN_INICIO: Record<string, string[]> = {
  sol: ['carolina-herrera-joya', 'monastery-oro', 'bahamas-blue-cristal', 'carolina-herrera-riviera'],
  formula: ['carolina-herrera-felina', 'mario-hernandez-bohemio', 'arturo-calle-popayan', 'karl-lagerfeld-marine'],
  'easy-click': ['trendi-clip-solar', 'the-look-piloto', 'pull-bear-malibu', 'the-look-terra'],
}

const pasosConsulta = [
  { titulo: 'Trae tus gafas actuales', texto: 'Si ya usas gafas, llévalas contigo. También puedes traer una fórmula anterior si la tienes.', Icon: Glasses },
  { titulo: 'Piensa en tu día a día', texto: 'Cuenta para qué actividades necesitas ver mejor: leer, trabajar frente a pantallas, conducir u otras.', Icon: ClipboardList },
  { titulo: 'Anota tus dudas', texto: 'Si has notado cambios en tu visión o tienes preguntas, apuntarlas te ayudará a recordarlas.', Icon: MessageCircleQuestion },
]

// Las dos tarjetas antes del footer: el test de rostro y la prueba virtual.
const herramientas = [
  {
    id: 'rostro',
    etiqueta: 'Asesoría',
    titulo: '¿Sabes cuál es tu tipo de rostro?',
    texto: 'Descúbrelo con un test sencillo y conoce las características de tu rostro.',
    accion: 'Descubrir mi tipo de rostro',
    to: '/tipo-de-rostro',
  },
  {
    id: 'probador',
    etiqueta: 'Experiencia digital',
    titulo: '¿Cómo te quedan antes de ir?',
    texto: 'Pruébate diferentes monturas virtualmente y descubre tu próximo estilo antes de agendar tu cita.',
    accion: 'Probar gafas ahora',
    to: '/prueba-virtual',
  },
]

export function Home() {
  const opticaRef = useRef<HTMLElement>(null)
  useParallax(opticaRef, 0.06)

  const tendencias = frames.filter((frame) => frame.trending).slice(0, TARJETAS_POR_SECCION)
  // Solo las pestañas de los tipos que tienen monturas en el catálogo.
  const tiposDeGafas = categorias
    .map((categoria) => {
      const destacadas = DESTACADAS_EN_INICIO[categoria.id] ?? []
      const orden = (id: string) => (destacadas.includes(id) ? destacadas.indexOf(id) : destacadas.length)
      const gafas = frames
        .filter((frame) => frame.category === categoria.id && !tendencias.includes(frame))
        .sort((a, b) => orden(a.id) - orden(b.id))
        .slice(0, TARJETAS_POR_SECCION)
      return { ...categoria, gafas }
    })
    .filter(({ gafas }) => gafas.length > 0)
  const [tipoElegido, setTipoElegido] = useState(tiposDeGafas[0]?.id)
  const tipoActivo = tiposDeGafas.find(({ id }) => id === tipoElegido) ?? tiposDeGafas[0]
  const flechasPestanas = useFlechas<HTMLDivElement>('.home-tipos__tab')

  return (
    <>
      <div className="hero-spacer" />

      <section className="home-discover" data-reveal>
        <div className="home-discover__copy">
          <p className="home-discover__eyebrow">Una recomendación para ti</p>
          <h2>¿No sabes qué montura elegir?</h2>
          <p>Responde 4 preguntas y te mostramos las gafas que mejor van contigo.</p>

          <ol className="home-discover__steps" aria-label="Así funciona el test">
            {pasosTest.map(({ label, Icon }, i) => (
              <li key={label}>
                <span className="home-discover__step-icon" aria-hidden="true"><Icon size={17} strokeWidth={2} /></span>
                <span><span className="home-discover__step-number">{i + 1}.</span> {label}</span>
              </li>
            ))}
          </ol>

          {/* Un solo botón principal. */}
          <div className="home-discover__actions">
            <Link className="home-discover__cta" to="/que-gafas-van-contigo">Empezar el test <span aria-hidden="true">→</span></Link>
            <span className="home-discover__time"><Clock size={16} aria-hidden="true" /> Toma 2 minutos</span>
          </div>

          <Link className="home-discover__photo-link" to="/tipo-de-rostro">
            ¿No conoces la forma de tu rostro? Te ayudamos con una foto <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Cada tarjeta tiene "Ver detalle" (esa gafa); "Ver catálogo completo",
          al final de la sección, lleva a todas. Las 4 van en una fila: si no
          caben (tableta, celular) se pasan con flechas, sin bajar a otra fila. */}
      <section className="home-section">
        <h2 className="home-section__title" data-reveal>Tendencias</h2>
        <div className="home-section__grid">
          <Carrusel etiqueta="Tendencias">
            {tendencias.map((frame) => <FrameCard key={frame.id} frame={frame} accion="ver" />)}
          </Carrusel>
          <div className="home-section__mas">
            <Link className="home-section__ver-todo" to="/catalogo">
              Ver catálogo completo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="optica" className="optica-photo" ref={opticaRef}>
        <img src={asset('/fotos/optica-equipo.webp')} alt="El equipo de Opticalia Van-Arcken & Mendoza dentro de la óptica" width={1774} height={887} loading="lazy" decoding="async" />
        <div className="optica-photo__shade" />
        <div className="optica-photo__content" data-reveal>
          <p className="optica-photo__eyebrow">Opticalia Van-Arcken &amp; Mendoza</p>
          <h2>Ver mejor también es sentirte tú.</h2>
          <p>Estamos aquí para acompañarte a cuidar tu salud visual.</p>
          <Link className="optica-photo__cta" to="/agenda">Agenda tu cita <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      {/* Pestañas Sol / Oftálmicas / Easy Click (category en frames.json). El
          botón del final lleva al catálogo ya filtrado por la pestaña abierta. */}
      {tipoActivo && (
        <section className="home-section home-section--tinted" aria-labelledby="home-tipos-titulo">
          <h2 id="home-tipos-titulo" className="home-section__title" data-reveal>Elige tu tipo de gafas</h2>
          <div className="home-section__grid">
            {tiposDeGafas.length > 1 && (
              <div className="home-tipos__tabs" role="tablist" aria-label="Tipo de gafas" ref={flechasPestanas}>
                {tiposDeGafas.map(({ id, label }) => (
                  <button
                    key={id}
                    id={`home-tab-${id}`}
                    type="button"
                    role="tab"
                    aria-selected={id === tipoActivo.id}
                    aria-controls="home-tipos-panel"
                    // Solo la pestaña abierta entra con Tab; entre pestañas se pasa con las flechas.
                    tabIndex={id === tipoActivo.id ? 0 : -1}
                    className={`home-tipos__tab ${id === tipoActivo.id ? 'home-tipos__tab--activa' : ''}`}
                    onClick={() => setTipoElegido(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div id="home-tipos-panel" role="tabpanel" aria-labelledby={`home-tab-${tipoActivo.id}`}>
              <p className="home-tipos__descripcion">
                {tipoActivo.id === 'easy-click' && <strong>2 en 1. </strong>}
                {tipoActivo.descripcion}
              </p>
              {/* key: al cambiar de pestaña la fila vuelve al principio. */}
              <Carrusel key={tipoActivo.id} etiqueta={tipoActivo.tipo}>
                {tipoActivo.gafas.map((frame) => <FrameCard key={frame.id} frame={frame} accion="ver" />)}
              </Carrusel>
              <div className="home-section__mas">
                <Link className="home-section__ver-todo" to={`/catalogo?tipo=${tipoActivo.slug}`}>
                  Ver catálogo completo de {tipoActivo.plural} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Texto y botón a la izquierda; los 3 pasos como lista numerada a la derecha. */}
      <section className="vision-care" aria-labelledby="vision-care-title">
        <div className="vision-care__inner">
          {/* Sin data-reveal: esta sección se anima con el scroll (CSS
              animation-timeline: view(), ver Home.scss), no al aparecer. */}
          <div className="vision-care__intro">
            <p className="vision-care__eyebrow">Una consulta más tranquila</p>
            <h2 id="vision-care-title">Prepárate para tu consulta visual</h2>
            <p>Unos pequeños detalles antes de venir pueden ayudar a que aproveches mejor la visita.</p>
            <Link className="vision-care__cta" to="/agenda">Agenda tu cita <span aria-hidden="true">→</span></Link>
          </div>

          {/* Cada paso avanza con el scroll: número, tarjeta y la línea al siguiente. */}
          <ol className="vision-care__steps">
            {pasosConsulta.map(({ titulo, texto, Icon }, i) => (
              <li key={titulo} className="vision-care__step" style={{ '--i': i } as CSSProperties}>
                <span className="vision-care__number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className="vision-care__card">
                  <h3><span className="vision-care__icon" aria-hidden="true"><Icon size={19} /></span>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Accesos a las herramientas digitales, antes del footer. Toda la
          tarjeta es el enlace; el "botón" de adentro es solo visual. */}
      <section className="herramientas" aria-label="Prueba nuestras herramientas antes de tu visita">
        <div className="herramientas__inner">
          {herramientas.map(({ id, etiqueta, titulo, texto, accion, to }) => (
            <Link key={id} className={`herramienta herramienta--${id}`} to={to}>
              <span className="herramienta__eyebrow">{etiqueta}</span>
              <h2 className="herramienta__title">{titulo}</h2>
              <p className="herramienta__text">{texto}</p>
              <span className="herramienta__cta">{accion} <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
