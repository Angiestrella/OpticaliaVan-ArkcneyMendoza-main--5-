import { useEffect } from 'react'
import { ArrowDown, ArrowUpRight, Eye, MapPin } from 'lucide-react'
import { asset } from '../../utils/asset'
import './Conocenos.scss'

const instagramUrl = 'https://www.instagram.com/opticalia.vym/'
const tiktokUrl = 'https://www.tiktok.com/@opticaliavym'
const mapaUrl = 'https://www.google.com/maps/search/?api=1&query=Opticalia+Van-Arcken+%26+Mendoza+Jumbo+Las+Vegas+Envigado'

export function Conocenos() {
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

    if (!document.getElementById('tiktok-embed-script')) {
      const script = document.createElement('script')
      script.id = 'tiktok-embed-script'
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <video className="about-hero__video" controls playsInline preload="metadata" aria-label="Video de los optometras contando sobre Opticalia Van-Arcken y Mendoza">
          <source src={asset('/hero.mp4')} type="video/mp4" />
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

      <section className="about-intro" id="nuestra-optica">
        <div className="about-intro__mark" aria-hidden="true"><Eye size={40} strokeWidth={1.4} /></div>
        <div>
          <p className="about-eyebrow">Cerca de ti, en Envigado</p>
          <h2>Tu espacio para ver y elegir con confianza.</h2>
          <p>Somos Opticalia Van-Arcken &amp; Mendoza, en Jumbo Las Vegas. Aquí puedes explorar monturas, conocer opciones para tu salud visual y recibir orientación para encontrar las gafas adecuadas para ti.</p>
        </div>
      </section>

      <section className="about-social" aria-labelledby="about-social-title">
        <div className="about-social__heading">
          <p className="about-eyebrow">Síguenos en redes</p>
          <h2 id="about-social-title">Un poco de nuestro día a día</h2>
          <p>Videos, novedades y consejos de Opticalia en Instagram y TikTok.</p>
        </div>
        <div className="about-social__feeds">
          <article className="about-social__feed">
            <div className="about-social__feed-heading">
              <div><span className="about-social__platform">Instagram</span><h3>@opticalia.vym</h3></div>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir perfil de Opticalia en Instagram"><ArrowUpRight size={19} /></a>
            </div>
            <div className="about-social__embed">
              <blockquote className="instagram-media" data-instgrm-permalink={instagramUrl} data-instgrm-version="14">
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Ver videos de Opticalia en Instagram</a>
              </blockquote>
            </div>
          </article>
          <article className="about-social__feed">
            <div className="about-social__feed-heading">
              <div><span className="about-social__platform">TikTok</span><h3>@opticaliavym</h3></div>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir perfil de Opticalia en TikTok"><ArrowUpRight size={19} /></a>
            </div>
            <div className="about-social__embed">
              <blockquote className="tiktok-embed" cite={tiktokUrl} data-unique-id="opticaliavym" data-embed-type="creator" style={{ maxWidth: 520, minWidth: 288 }}>
                <section><a target="_blank" rel="noreferrer" href={tiktokUrl}>@opticaliavym en TikTok</a></section>
              </blockquote>
            </div>
          </article>
        </div>
      </section>

      <section className="about-visit" aria-labelledby="about-visit-title">
        <div className="about-visit__copy">
          <p className="about-eyebrow">Ven a visitarnos</p>
          <h2 id="about-visit-title">Nos encuentras en Jumbo Las Vegas</h2>
          <p>Local 1001 · Envigado, Antioquia</p>
          <a className="about-button" href={mapaUrl} target="_blank" rel="noopener noreferrer">
            <MapPin size={17} /> Cómo llegar <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="about-visit__map">
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
