import { FrameCard } from '../../components/FrameCard/FrameCard'
import frames from '../../data/frames.json'
import './Home.scss'

export function Home() {
  const tendencias = frames.filter((frame) => frame.trending)
  const gafasDeSol = frames.filter((frame) => frame.category === 'sol')

  return (
    <>
      <div className="hero-spacer" />

      <section className="home-section">
        <h2 className="home-section__title">Tendencias</h2>
        <div className="home-section__grid">
          {tendencias.map((frame) => (
            <FrameCard key={frame.id} frame={frame} />
          ))}
        </div>
      </section>

      <section id="optica" className="optica-photo">
        <img
          src="/optica-fachada.jpeg"
          alt="Fachada de Opticalia Van-Arcken & Mendoza"
        />
      </section>

      <section className="home-section">
        <h2 className="home-section__title">Nuestras gafas de sol</h2>
        <div className="home-section__grid">
          {gafasDeSol.map((frame) => (
            <FrameCard key={frame.id} frame={frame} />
          ))}
        </div>
      </section>
    </>
  )
}
