import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowUpRight, Eye, MapPin } from 'lucide-react'
import { asset } from '../../utils/asset'
import './Conocenos.scss'

const instagramUrl = 'https://www.instagram.com/opticalia.vym/'
const tiktokUrl = 'https://www.tiktok.com/@opticaliavym'
const mapaUrl = 'https://www.google.com/maps/search/?api=1&query=Opticalia+Van-Arcken+%26+Mendoza+Jumbo+Las+Vegas+Envigado'

// Logos de las redes (lucide ya no incluye íconos de marcas).
function LogoInstagram({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LogoTikTok({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

export function Conocenos() {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Los navegadores solo dejan reproducir automáticamente un video silenciado.
  // Este video no tiene sonido: es un saludo corto que se repite.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.play().catch(() => {})
  }, [])

  useEffect(() => {
    const instagramWindow = window as Window & { instgrm?: { Embeds?: { process: () => void } } }
    const instagramScript = document.getElementById('instagram-embed-script') as HTMLScriptElement | null
    if (!instagramScript) {
      const script = document.createElement('script')
      script.id = 'instagram-embed-script'
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.onload = () => instagramWindow.instgrm?.Embeds?.process()
      document.body.appendChild(script)
    } else {
      instagramWindow.instgrm?.Embeds?.process()
    }
    // TikTok ya no se inserta: su recuadro de perfil lo bloquea TikTok
    // ("overload-protect triggered"). En su lugar va una tarjeta propia.

    // El script de Instagram crea su <iframe> sin título; sin él, el lector de
    // pantalla solo dice "marco". Se le pone uno apenas aparece.
    const ponerTitulo = () => {
      document.querySelectorAll<HTMLIFrameElement>('iframe[id^="instagram-embed"]').forEach((iframe) => {
        if (!iframe.title) iframe.title = 'Publicaciones de Opticalia en Instagram'
      })
    }
    ponerTitulo()
    const observador = new MutationObserver(ponerTitulo)
    observador.observe(document.body, { childList: true, subtree: true })
    return () => observador.disconnect()
  }, [])

  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <video
          ref={videoRef}
          className="about-hero__video"
          autoPlay
          muted
          loop
          controls
          playsInline
          preload="auto"
          poster={asset('/conocenos-poster.webp')}
          aria-label="Video de los optómetras de Opticalia Van-Arcken y Mendoza saludando desde la óptica"
        >
          <source src={asset('/conocenos.mp4')} type="video/mp4" />
          Tu navegador no puede reproducir este video.
        </video>
        <div className="about-hero__veil" />
        <div className="about-hero__content">
          <p className="about-eyebrow">Opticalia Van-Arcken &amp; Mendoza</p>
          <h1 id="about-title">Una mirada más clara a lo que te hace único.</h1>
          <p>Conoce nuestra óptica y cómo llegar.</p>
          <a className="about-hero__scroll" href="#nuestra-optica">Conócenos <ArrowDown size={17} /></a>
        </div>
      </section>

      <section className="about-intro" id="nuestra-optica" data-reveal>
        <div className="about-intro__mark" aria-hidden="true"><Eye size={40} strokeWidth={1.4} /></div>
        <div>
          <p className="about-eyebrow">Cerca de ti, en Envigado</p>
          <h2>Tu espacio para ver y elegir con confianza.</h2>
          <p>Somos Opticalia Van-Arcken &amp; Mendoza, en Jumbo Las Vegas. Aquí puedes explorar monturas, conocer opciones para tu salud visual y recibir orientación para encontrar las gafas adecuadas para ti.</p>
        </div>
      </section>

      <section className="about-social" aria-labelledby="about-social-title">
        <div className="about-social__heading" data-reveal>
          <p className="about-eyebrow">Síguenos en redes</p>
          <h2 id="about-social-title">Un poco de nuestro día a día</h2>
          <p>Videos, novedades y consejos de Opticalia en Instagram y TikTok.</p>
        </div>
        <div className="about-social__feeds" data-reveal-group>
          <article className="about-social__feed">
            <div className="about-social__feed-heading">
              <div><span className="about-social__platform">Instagram</span><h3>@opticalia.vym</h3></div>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir perfil de Opticalia en Instagram"><ArrowUpRight size={19} /></a>
            </div>
            <div className="about-social__embed">
              {/* Respaldo: queda detrás de las publicaciones y solo se ve si Instagram
                  no carga (bloqueadores de anuncios, navegador, sin conexión…). */}
              <div className="about-social__fallback">
                <span className="about-social__fallback-logo"><LogoInstagram size={30} /></span>
                <p>Mira nuestras publicaciones y videos en Instagram.</p>
                <a className="about-social__open" href={instagramUrl} target="_blank" rel="noopener noreferrer">Abrir Instagram <ArrowUpRight size={16} /></a>
              </div>
              <blockquote className="instagram-media" data-instgrm-permalink={instagramUrl} data-instgrm-version="14">
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Ver videos de Opticalia en Instagram</a>
              </blockquote>
            </div>
            <a className="about-social__open about-social__open--full" href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <LogoInstagram size={18} /> Ver perfil en Instagram <ArrowUpRight size={16} />
            </a>
          </article>
          <article className="about-social__feed">
            <div className="about-social__feed-heading">
              <div><span className="about-social__platform">TikTok</span><h3>@opticaliavym</h3></div>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir perfil de Opticalia en TikTok"><ArrowUpRight size={19} /></a>
            </div>
            {/* Tarjeta propia con el estilo de TikTok: siempre funciona. */}
            <a className="about-social__tiktok" href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              <span className="about-social__tiktok-logo"><LogoTikTok size={44} /></span>
              <strong>@opticaliavym</strong>
              <p>Videos cortos con consejos para cuidar tu vista, novedades en monturas y el día a día de la óptica.</p>
              <span className="about-social__tiktok-tags" aria-hidden="true">
                <span>#saludvisual</span><span>#gafas</span><span>#envigado</span>
              </span>
              <span className="about-social__tiktok-cta">Ver nuestros videos <ArrowUpRight size={17} /></span>
            </a>
            <a className="about-social__open about-social__open--full" href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              <LogoTikTok size={16} /> Ver perfil en TikTok <ArrowUpRight size={16} />
            </a>
          </article>
        </div>
      </section>

      {/* id="ubicacion": a esta sección lleva "Ubicación" de la barra de navegación. */}
      <section className="about-visit" id="ubicacion" aria-labelledby="about-visit-title">
        <div className="about-visit__copy" data-reveal>
          <p className="about-eyebrow">Ven a visitarnos</p>
          <h2 id="about-visit-title">Nos encuentras en Jumbo Las Vegas</h2>
          <p>Local 1001 · Envigado, Antioquia</p>
          <a className="about-button" href={mapaUrl} target="_blank" rel="noopener noreferrer">
            <MapPin size={17} /> Cómo llegar <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="about-visit__map" data-reveal="zoom">
          <iframe
            title="Mapa de Opticalia Van-Arcken & Mendoza en Jumbo Las Vegas, Envigado"
            src="https://maps.google.com/maps?q=Opticalia%20Van-Arcken%20%26%20Mendoza%20Jumbo%20Las%20Vegas%20Envigado&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  )
}
