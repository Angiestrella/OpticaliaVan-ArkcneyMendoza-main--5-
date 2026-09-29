import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { parseEnlacesSitio, type EnlaceSitio } from '../../utils/sitemap'
import './Footer.scss'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [enlaces, setEnlaces] = useState<EnlaceSitio[]>([])

  useEffect(() => {
    fetch('/navegacion.xml')
      .then((respuesta) => respuesta.text())
      .then((xml) => setEnlaces(parseEnlacesSitio(xml)))
  }, [])

  return (
    <footer className="footer">
      <div className="footer__photo" />

      <div className="footer__content">
        <div className="footer__grid">
          <div className="footer__column">
            <h3>Ubicación</h3>
            <p className="footer__line">
              <MapPin size={16} strokeWidth={1.8} />
              Dirección pendiente
            </p>
          </div>

          <div className="footer__column">
            <h3>Redes</h3>
            <div className="footer__social">
              <a href="#">Instagram</a>
              <a href="#">Facebook</a>
            </div>
          </div>

          <div className="footer__column">
            <h3>Mapa del sitio</h3>
            <div className="footer__social">
              {enlaces.map(({ href, label }) => (
                <Link key={href} to={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer__column">
            <h3>Contacto</h3>
            <p className="footer__line">
              <Mail size={16} strokeWidth={1.8} />
              Correo pendiente
            </p>
            <p className="footer__line">
              <Phone size={16} strokeWidth={1.8} />
              Teléfono pendiente
            </p>
          </div>
        </div>

        <p className="footer__copyright">
          &copy; {currentYear} Opticalia. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
