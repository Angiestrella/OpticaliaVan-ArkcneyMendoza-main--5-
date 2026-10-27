import { FrameCard } from '../../components/FrameCard/FrameCard'
import { Link } from 'react-router-dom'
import { ClipboardList, Glasses, MessageCircleQuestion } from 'lucide-react'
import frames from '../../data/frames.json'
import './Home.scss'

export function Home() {
  const tendenciasDisponibles = frames.filter((frame) => frame.trending)
  const gafasDeSolDisponibles = frames.filter((frame) => frame.category === 'sol')
  const ampliarA = (items: typeof frames, minimo: number) =>
    items.length === 0
      ? []
      : Array.from({ length: Math.max(items.length, minimo) }, (_, index) => items[index % items.length])
  const tendencias = ampliarA(tendenciasDisponibles, 4)
  const gafasDeSol = ampliarA(gafasDeSolDisponibles, 4)

  return (
    <>
      <div className="hero-spacer" />

      <section className="home-discover">
        <div className="home-discover__copy">
          <p className="home-discover__eyebrow">Una recomendación para ti</p>
          <h2>¿No sabes qué montura elegir?</h2>
          <p>Responde unas preguntas y descubre monturas según tu rostro, lo que buscas y los colores que te gustan. Te tomará cerca de 2 minutos.</p>
          <Link className="home-discover__cta" to="/que-gafas-van-contigo">Descubre tus gafas ideales <span aria-hidden="true">→</span></Link>
          <Link className="home-discover__face" to="/que-gafas-van-contigo">
            <span className="home-discover__face-icon" aria-hidden="true">
              <img src="/chica%20con%20signo%20de%20interrogaci%C3%B3n.png" alt="" />
            </span>
            <span className="home-discover__face-copy">
              <strong>¿No sabes tu tipo de rostro?</strong>
              <small>Sube una foto y te ayudamos a identificarlo.</small>
            </span>
            <span className="home-discover__face-action">Identificar <span aria-hidden="true">→</span></span>
          </Link>
        </div>
        <div className="home-discover__mark" aria-hidden="true">◎</div>
      </section>

      <section className="home-section">
        <h2 className="home-section__title">Tendencias</h2>
        <div className="home-section__grid">
          {tendencias.map((frame, index) => (
            <FrameCard key={`${frame.id}-${index}`} frame={frame} />
          ))}
        </div>
      </section>

      <section id="optica" className="optica-photo">
        <img src="/optica-fachada.jpeg" alt="Fachada de Opticalia Van-Arcken & Mendoza" />
        <div className="optica-photo__shade" />
        <div className="optica-photo__content">
          <p className="optica-photo__eyebrow">Opticalia Van-Arcken &amp; Mendoza</p>
          <h2>Ver mejor también es sentirte tú.</h2>
          <p>Estamos aquí para acompañarte a cuidar tu salud visual.</p>
          <Link className="optica-photo__cta" to="/agenda">Agenda tu cita <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="vision-care" aria-labelledby="vision-care-title">
        <div className="vision-care__intro">
          <p className="vision-care__eyebrow">Una consulta más tranquila</p>
          <h2 id="vision-care-title">Prepárate para tu consulta visual</h2>
          <p>Unos pequeños detalles antes de venir pueden ayudar a que aproveches mejor la visita.</p>
        </div>
        <div className="vision-care__cards">
          <article className="vision-care__card">
            <span className="vision-care__icon"><Glasses size={23} /></span>
            <span className="vision-care__step">01</span>
            <h3>Trae tus gafas actuales</h3>
            <p>Si ya usas gafas, llévalas contigo. También puedes traer una fórmula anterior si la tienes.</p>
          </article>
          <article className="vision-care__card vision-care__card--featured">
            <span className="vision-care__icon"><ClipboardList size={23} /></span>
            <span className="vision-care__step">02</span>
            <h3>Piensa en tu día a día</h3>
            <p>Cuenta para qué actividades necesitas ver mejor: leer, trabajar frente a pantallas, conducir u otras.</p>
          </article>
          <article className="vision-care__card">
            <span className="vision-care__icon"><MessageCircleQuestion size={23} /></span>
            <span className="vision-care__step">03</span>
            <h3>Anota tus dudas</h3>
            <p>Si has notado cambios en tu visión o tienes preguntas, apuntarlas te ayudará a recordarlas.</p>
          </article>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section__title">Nuestras gafas de sol</h2>
        <div className="home-section__grid">
          {gafasDeSol.map((frame, index) => (
            <FrameCard key={`${frame.id}-${index}`} frame={frame} />
          ))}
        </div>
      </section>
    </>
  )
}
