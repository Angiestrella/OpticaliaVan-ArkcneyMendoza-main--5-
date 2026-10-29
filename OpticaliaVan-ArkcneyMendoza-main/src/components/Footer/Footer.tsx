import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react'
import { contacto } from '../../data'
import { useEnlacesSitio } from '../../utils/sitemap'
import { buildWhatsappUrl } from '../../utils/whatsapp'
import { asset } from '../../utils/asset'
import './Footer.scss'

export function Footer() {
  const currentYear = new Date().getFullYear()
  // Todos los enlaces de public/navegacion.xml (la misma fuente que usa la barra).
  const enlaces = useEnlacesSitio()
  const videoRef = useRef<HTMLVideoElement>(null)

  // El video solo se descarga cuando la persona se acerca al pie de página
  // (antes se bajaban 2.4 MB en cada página aunque nadie llegara hasta acá),
  // y se pausa cuando sale de la pantalla. Arranca silenciado (los navegadores
  // solo reproducen solos los videos sin sonido). Quien tiene activado "reducir
  // movimiento" ve un cuadro fijo: el final, con el logo.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mostrarLogo = () => { video.currentTime = Math.max(0, video.duration - 0.3) }

    const observador = new IntersectionObserver(([entrada]) => {
      // Mientras la página se arma, el observador puede avisar "visible" un
      // instante antes de tiempo: se confirma con la posición real del video.
      const visible = entrada.isIntersecting && video.getBoundingClientRect().top < window.innerHeight
      if (!visible) {
        video.pause()
        return
      }
      if (sinMovimiento) {
        if (video.readyState >= 1) mostrarLogo()
        else {
          video.addEventListener('loadedmetadata', mostrarLogo, { once: true })
          video.preload = 'metadata'
          video.load()
        }
        return
      }
      video.play().catch(() => {})
    }, { threshold: 0.1 }) // empieza cuando se ve al menos un 10 % del video

    observador.observe(video)
    return () => observador.disconnect()
  }, [])

  const whatsappUrl = buildWhatsappUrl(contacto.whatsapp, 'Hola, quiero conocer más sobre sus gafas.')

  return (
    <footer className="footer">
      {/* Tres bloques claros: video | Explora | Hablemos. */}
      <div className="footer__main" data-reveal-group>
        {/* Video decorativo: misma proporción del archivo (1452×634), sin recortes. */}
        <div className="footer__video">
          <video
            ref={videoRef}
            src={asset('/video-footer.mp4')}
            loop
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        <nav className="footer__links" aria-label="Enlaces del sitio">
          <h2>Explora</h2>
          <ul>
            {enlaces.map(({ href, label }) => <li key={href}><Link to={href}>{label}</Link></li>)}
          </ul>
        </nav>

        <div className="footer__contact">
          <h2>Hablemos</h2>
          <p>Estamos para ayudarte a encontrar tus próximas gafas.</p>
          <a href={`tel:+${contacto.whatsapp}`}><Phone size={17} /> +57 322 519 3785</a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Consultar por <span className="footer__nowrap">WhatsApp <ArrowUpRight size={16} /></span></a>
        </div>
      </div>

      {/* Firma de la página: logo y frase a la izquierda, © y "volver" a la derecha. */}
      <div className="footer__bottom">
        <div className="footer__brand">
          <Link to="/" aria-label="Opticalia, ir al inicio">
            <img src={asset('/logo-opticalia.svg')} alt="Opticalia Van-Arcken & Mendoza" loading="lazy" />
          </Link>
          <p>Una mirada más clara a lo que te hace único.</p>
        </div>
        <div className="footer__legal">
          <span>© {currentYear} Opticalia Van-Arcken &amp; Mendoza</span>
          <Link to="/">Volver al inicio <span aria-hidden="true">↑</span></Link>
        </div>
      </div>
    </footer>
  )
}
