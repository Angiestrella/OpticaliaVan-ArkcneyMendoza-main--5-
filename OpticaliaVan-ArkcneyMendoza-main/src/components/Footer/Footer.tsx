import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react'
import contact from '../../data/contact.json'
import { parseEnlacesSitio, type EnlaceSitio } from '../../utils/sitemap'
import { buildWhatsappUrl } from '../../utils/whatsapp'
import { asset } from '../../utils/asset'
import './Footer.scss'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [enlaces, setEnlaces] = useState<EnlaceSitio[]>([])

  useEffect(() => {
    fetch(asset('/navegacion.xml'))
      .then((respuesta) => respuesta.text())
      .then((xml) => setEnlaces(parseEnlacesSitio(xml)))
      .catch(() => setEnlaces([]))
  }, [])

  const whatsappUrl = buildWhatsappUrl(contact.whatsapp, 'Hola, quiero conocer más sobre sus gafas.')

  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <Link to="/" aria-label="Opticalia, ir al inicio">
            <img src={asset('/logo-opticalia.svg')} alt="Opticalia Van-Arcken & Mendoza" />
          </Link>
          <p>Una mirada más clara a lo que te hace único.</p>
          <a className="footer__whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> Escríbenos por WhatsApp
          </a>
        </div>

        <nav className="footer__links" aria-label="Enlaces del sitio">
          <h3>Explora</h3>
          {enlaces.map(({ href, label }) => <Link key={href} to={href}>{label}</Link>)}
        </nav>

        <div className="footer__contact">
          <h3>Hablemos</h3>
          <p>Estamos para ayudarte a encontrar tus próximas gafas.</p>
          <a href={`tel:+${contact.whatsapp}`}><Phone size={17} /> +57 322 519 3785</a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp <ArrowUpRight size={16} /></a>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {currentYear} Opticalia Van-Arcken &amp; Mendoza</span>
        <Link to="/">Volver al inicio <span aria-hidden="true">↑</span></Link>
      </div>
    </footer>
  )
}
