import { useRef, type CSSProperties } from 'react'
import { FrameCard } from '../../components/FrameCard/FrameCard'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, Glasses, MessageCircleQuestion, Palette, ScanFace, UserRound } from 'lucide-react'
import { frames } from '../../data'
import { asset } from '../../utils/asset'
import { useParallax } from '../../utils/useParallax'
import './Home.scss'

// Las 4 preguntas del test, para que se entienda qué va a pasar antes de empezar.
const pasosTest = [
  { label: 'Tu rostro', Icon: ScanFace },
  { label: 'Qué buscas', Icon: Glasses },
  { label: 'Tu estilo', Icon: UserRound },
  { label: 'Tus colores', Icon: Palette },
]

// Inicio muestra 4 tarjetas por sección (una fila en escritorio); el resto está en el catálogo.
const TARJETAS_POR_SECCION = 4
// Gafas de sol que salen primero en Inicio: una de cada marca para mostrar variedad.
const SOL_EN_INICIO = ['carolina-herrera-joya', 'monastery-oro', 'the-look-piloto', 'bahamas-blue-cristal']

const pasosConsulta = [
  { titulo: 'Trae tus gafas actuales', texto: 'Si ya usas gafas, llévalas contigo. También puedes traer una fórmula anterior si la tienes.', Icon: Glasses },
  { titulo: 'Piensa en tu día a día', texto: 'Cuenta para qué actividades necesitas ver mejor: leer, trabajar frente a pantallas, conducir u otras.', Icon: ClipboardList },
  { titulo: 'Anota tus dudas', texto: 'Si has notado cambios en tu visión o tienes preguntas, apuntarlas te ayudará a recordarlas.', Icon: MessageCircleQuestion },
]

export function Home() {
  const opticaRef = useRef<HTMLElement>(null)
  useParallax(opticaRef)

  const tendencias = frames.filter((frame) => frame.trending).slice(0, TARJETAS_POR_SECCION)
  // Primero las elegidas en SOL_EN_INICIO; si alguna ya no existe, se completa con las demás de sol.
  const destacadaSol = (id: string) => (SOL_EN_INICIO.includes(id) ? 1 : 0)
  const gafasDeSol = frames
    .filter((frame) => frame.category === 'sol')
    .sort((a, b) => destacadaSol(b.id) - destacadaSol(a.id))
    .slice(0, TARJETAS_POR_SECCION)

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

          {/* Lleva directo a identificar el rostro con una foto (?ayuda=foto, ver TestGafas). */}
          <Link className="home-discover__photo-link" to="/que-gafas-van-contigo?ayuda=foto">
            ¿No conoces la forma de tu rostro? Te ayudamos con una foto <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section__title" data-reveal>Tendencias</h2>
        {/* Grid de Bootstrap: 2 por fila en celular, 3 en tablet, 4 en escritorio. */}
        <div className="home-section__grid">
          <div className="row g-4 justify-content-center" data-reveal-group>
            {tendencias.map((frame) => (
              <div key={frame.id} className="col-6 col-md-4 col-xl-3">
                <FrameCard frame={frame} accion="ver" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="optica" className="optica-photo" ref={opticaRef}>
        <img src={asset('/optica-fachada.webp')} alt="Fachada de Opticalia Van-Arcken & Mendoza" width={1280} height={960} loading="lazy" decoding="async" />
        <div className="optica-photo__shade" />
        <div className="optica-photo__content" data-reveal>
          <p className="optica-photo__eyebrow">Opticalia Van-Arcken &amp; Mendoza</p>
          <h2>Ver mejor también es sentirte tú.</h2>
          <p>Estamos aquí para acompañarte a cuidar tu salud visual.</p>
          <Link className="optica-photo__cta" to="/agenda">Agenda tu cita <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      {/* Solo aparece si el catálogo tiene gafas de sol (category "sol" en frames.json). */}
      {gafasDeSol.length > 0 && (
        <section className="home-section home-section--tinted">
          <h2 className="home-section__title" data-reveal>Nuestras gafas de sol</h2>
          <div className="home-section__grid">
            <div className="row g-4 justify-content-center" data-reveal-group>
              {gafasDeSol.map((frame) => (
                <div key={frame.id} className="col-6 col-md-4 col-xl-3">
                  <FrameCard frame={frame} accion="ver" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Texto y botón a la izquierda; los 3 pasos como lista numerada a la derecha. */}
      <section className="vision-care" aria-labelledby="vision-care-title">
        <div className="vision-care__inner">
          <div className="vision-care__intro" data-reveal>
            <p className="vision-care__eyebrow">Una consulta más tranquila</p>
            <h2 id="vision-care-title">Prepárate para tu consulta visual</h2>
            <p>Unos pequeños detalles antes de venir pueden ayudar a que aproveches mejor la visita.</p>
            <Link className="vision-care__cta" to="/agenda">Agenda tu cita <span aria-hidden="true">→</span></Link>
          </div>

          {/* data-reveal="secuencia": al aparecer, los números salen uno a uno y la
              línea se dibuja de un número al siguiente (ver Home.scss). */}
          <ol className="vision-care__steps" data-reveal="secuencia">
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
    </>
  )
}
