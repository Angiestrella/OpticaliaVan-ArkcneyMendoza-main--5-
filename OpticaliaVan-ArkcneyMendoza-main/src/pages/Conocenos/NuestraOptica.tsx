import { Link } from 'react-router-dom'
import { ArrowRight, Eye, HeartHandshake, MapPin, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { asset } from '../../utils/asset'

// No van nombres de personas: su uso público está por autorizar.
const valores = [
  { titulo: 'Cercanía', texto: 'Te escuchamos y te acompañamos sin presionarte.', Icon: HeartHandshake },
  { titulo: 'Confianza', texto: 'Te explicamos todo con claridad para que decidas con seguridad.', Icon: ShieldCheck },
  { titulo: 'Personalización', texto: 'No hay un lente igual para todos: pensamos en tu rutina y en lo que haces cada día.', Icon: SlidersHorizontal },
  { titulo: 'Bienestar visual', texto: 'Ver mejor es vivir mejor. Por eso te acompañamos a cuidar tu salud visual.', Icon: Eye },
]

const acompanamiento = [
  { titulo: 'Te escuchamos', texto: 'Te dedicamos tiempo y conocemos tu día a día: si conduces mucho, si trabajas frente a una pantalla o qué te preocupa de tu visión.' },
  { titulo: 'Te orientamos', texto: 'Te contamos tus opciones en palabras claras y te ayudamos a elegir lentes y montura según tu fórmula, tus actividades y tu estilo.' },
  { titulo: 'Te acompañamos', texto: 'Revisamos tus gafas antes de entregártelas y seguimos contigo después, con ajustes y seguimiento.' },
]

// Bloque de la página Conócenos: historia con el equipo, valores y forma de atender.
export function NuestraOptica() {
  return (
    <div className="about-story">
      <section className="about-story__history" aria-labelledby="about-historia-title">
        <div className="about-story__history-inner">
          <div className="about-story__history-head" data-reveal>
            <p className="about-eyebrow">Nuestra historia</p>
            <h2 id="about-historia-title">Una mirada que comenzó con el deseo de cuidar.</h2>
          </div>

          <div className="about-story__photos" data-reveal="zoom">
            <img
              className="about-story__photo-main"
              src={asset('/fotos/optica-equipo.webp')}
              alt="Los dos optómetras de Opticalia Van-Arcken & Mendoza dentro de la óptica"
              width={1774}
              height={887}
              loading="lazy"
              decoding="async"
            />
            <img
              className="about-story__photo-small"
              src={asset('/fotos/optica-fachada.webp')}
              alt="Entrada de Opticalia Van-Arcken & Mendoza en Jumbo Las Vegas"
              width={1280}
              height={960}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="about-story__history-text" data-reveal>
            <p>En septiembre de 2018, Opticalia Van-Arcken &amp; Mendoza abrió sus puertas en Jumbo Las Vegas, Envigado. Comenzamos con un consultorio y una pequeña sala de espera, pero con algo que sigue siendo esencial para nosotros: el compromiso de cuidar la visión de cada persona.</p>
            <p>Desde entonces, hemos construido una historia de cercanía, confianza y acompañamiento. Porque detrás de cada consulta hay alguien que quiere volver a leer con comodidad, disfrutar de sus días, trabajar, conducir o simplemente ver con mayor claridad.</p>
            <p>Hoy seguimos creciendo como parte de la red Opticalia, bajo la dirección de nuestros propios optómetras. Somos un equipo que cree que una buena atención comienza escuchando, continúa con una orientación profesional y se convierte en una experiencia que va más allá de elegir unas gafas.</p>
          </div>

          <p className="about-story__closing" data-reveal>
            Nuestra razón de ser sigue siendo la misma: <strong>ayudarte a ver mejor para vivir mejor.</strong>
          </p>
        </div>
      </section>

      <section className="about-story__values" aria-labelledby="about-valores-title">
        <div className="about-story__heading" data-reveal>
          <p className="about-eyebrow">Nuestros valores</p>
          <h2 id="about-valores-title">Lo que nos mueve</h2>
        </div>
        <ul className="about-story__values-grid" data-reveal-group>
          {valores.map(({ titulo, texto, Icon }) => (
            <li key={titulo}>
              <span className="about-story__icon" aria-hidden="true"><Icon size={24} strokeWidth={1.8} /></span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-story__care" aria-labelledby="about-acompanar-title">
        <div className="about-story__care-inner">
          <div className="about-story__heading" data-reveal>
            <p className="about-eyebrow">Nuestra forma de acompañarte</p>
            <h2 id="about-acompanar-title">Contigo en cada paso</h2>
          </div>
          <ol className="about-story__steps" data-reveal-group>
            {acompanamiento.map(({ titulo, texto }, i) => (
              <li key={titulo}>
                <span className="about-story__step-number" aria-hidden="true">{i + 1}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>

          <div className="about-story__cta" data-reveal>
            <div>
              <h2>Ven a conocernos</h2>
              <p>Agenda tu cita o pasa a visitarnos en Jumbo Las Vegas.</p>
            </div>
            <div className="about-story__cta-actions">
              <Link className="about-button about-button--light" to="/agenda">
                Agenda tu cita <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a className="about-story__cta-link" href="#ubicacion">
                <MapPin size={17} aria-hidden="true" /> Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
